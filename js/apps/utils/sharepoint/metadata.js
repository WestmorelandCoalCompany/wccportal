define([
    'app',
    'SP.runtime',
    'SP',
    'SP.taxonomy'
], function (App) {
    App.module('Main.Metadata', {
        define: function (Metadata, App, Backbone, Marionette, $, _) {
            // Module Variables
            Metadata.channel = Backbone.Radio.channel('global');

            // Metadata URLs and Routing Names
            Metadata.urls = {
                navigation: {
                    termStore: 'Managed Metadata Service',
                    group: 'Navigation',
                    termSet: 'Master Navigation'
                }
            };

            // Internal Methods

            // Request managed metadata
            function fetch_navigation(urlObject) {
                var deferred = $.Deferred(function () {
                    var context = SP.ClientContext.get_current(),
                    taxonomySession = SP.Taxonomy.TaxonomySession.getTaxonomySession(context),
                    termStores = taxonomySession.get_termStores(),
                    groups = termStores.getByName(urlObject.termStore).get_groups(),
                    termSets = groups.getByName(urlObject.group).get_termSets(),
                    terms = termSets.getByName(urlObject.termSet).getAllTerms();

                    context.load(terms);
                    context.executeQueryAsync(
                        function () {
                            var response = build_hierarchy(terms);
                            deferred.resolve(response && response.children);
                        },
                        function (sender, args) {
                            deferred.reject(args.get_message());
                        }
                    );
                });
                return deferred.promise();
            }

            // Build the hierarchy
            function build_hierarchy(terms) {
                var termsEnumerator = terms.getEnumerator(),
                tree = {
                    term: terms,
                    children: []
                };

                while (termsEnumerator.moveNext()) {
                    var currentTerm = termsEnumerator.get_current();
                    var currentTermPath = currentTerm.get_pathOfTerm().split(';');
                    var children = tree.children;

                    // Loop through each part of the path
                    for (var i = 0; i < currentTermPath.length; i++) {
                        var foundNode = false;

                        for (var j = 0; j < children.length; j++) {
                            if (children[j].name === currentTermPath[i]) {
                                foundNode = true;
                                break;
                            }
                        }

                        // Select the node, otherwise create a new one
                        var term = foundNode ? children[j] : { name: currentTermPath[i], children: [] };

                        // If we're a child element, add the term properties
                        if (i === currentTermPath.length - 1) {
                            term.term = currentTerm;
                            term.title = currentTerm.get_name();
                            term.id = currentTerm.get_id().toString();
                            term.properties = currentTerm.get_localCustomProperties();
                        }

                        // If the node did exist, let's look there next iteration
                        if (foundNode) {
                            children = term.children;
                        }
                            // If the segment of path does not exist, create it
                        else {
                            children.push(term);

                            // Reset the children pointer to add there next iteration
                            if (i !== currentTermPath.length - 1) {
                                children = term.children;
                            }
                        }
                    }
                }
                tree = sort_tree(tree);
                return tree;
            }

            // Sort the hierarchy
            function sort_tree(tree) {
                // Check to see if the get_customSortOrder function is defined. If the term is actually a term collection,
                // there is nothing to sort.
                if (tree.children.length && tree.term.get_customSortOrder) {
                    var sortOrder = null;

                    if (tree.term.get_customSortOrder()) {
                        sortOrder = tree.term.get_customSortOrder();
                    }

                    // If not null, the custom sort order is a string of GUIDs, delimited by a :
                    if (sortOrder) {
                        sortOrder = sortOrder.split(':');

                        tree.children.sort(function (a, b) {
                            var indexA = sortOrder.indexOf(a.id);
                            var indexB = sortOrder.indexOf(b.id);

                            if (indexA > indexB) {
                                return 1;
                            } else if (indexA < indexB) {
                                return -1;
                            }

                            return 0;
                        });
                    }
                        // If null, terms are just sorted alphabetically
                    else {
                        tree.children.sort(function (a, b) {
                            if (a.title > b.title) {
                                return 1;
                            } else if (a.title < b.title) {
                                return -1;
                            }

                            return 0;
                        });
                    }
                }

                for (var i = 0; i < tree.children.length; i++) {
                    tree.children[i] = sort_tree(tree.children[i]);
                }

                return tree;
            }

            // API
            var API = {
                fetchNavigation: function () {
                    return fetch_navigation(Metadata.urls.navigation);
                }
            };

            // Messaging
            Metadata.channel.reply('utils:sharepoint:metadata:fetch', function () {
                return API.fetchNavigation();
            });
        }
    });

    return;
})