define([
    'app',
    'SP.runtime',
    'SP',
    'SP.taxonomy'
], function (App) {
    App.module('Main.Metadata', {
        define: function (Metadata, App, Backbone, Marionette, $, _) {
            // ### Module Variables
            Metadata.urls = {
                navigation: {
                    termStore: 'Managed Metadata Service',
                    group: 'Navigation',
                    termSet: 'Master Navigation'
                }
            }

            // ### Internal Methods

            // Request managed metadata
            function fetch_navigation(urlObject, callback) {
                var deferred = $.Deferred(function () {
                    var context = SP.ClientContext.get_current(),
                    taxonomySession = SP.Taxonomy.TaxonomySession.getTaxonomySession(context),
                    termStores = taxonomySession.get_termStores(),
                    groups = termStores.getByName(urlObject.termStore).get_groups(),
                    termSets = groups.getByName(urlObject.group).get_termSets(),
                    terms = termSets.getByName(urlObject.termSet).getAllTerms();

                    context.load(terms);
                    context.executeQueryAsync(
                        //function () {
                        //    var termsEnumerator = terms.getEnumerator();
                        //    var response = []; //Empty tree
                        //    while (termsEnumerator.moveNext()) { //Iterate through terms placing them in the tree                                                                                                                
                        //        //var currentTerm = termsEnumerator.get_current();
                        //        //var currentTermPath = currentTerm.get_pathOfTerm().split(';');
                        //        //response = recursive_tree(response, currentTermPath);

                                

                        //    }
                        //    response = sortTree(response);
                        //    console.log(JSON.stringify(response));
                        //    deferred.resolve(response);
                        //},
                        function () {
                            build_hierarchy(terms, callback);
                        },
                        function (sender, args) {
                            deferred.reject(args.get_message());
                        }
                    );
                });
                return deferred.promise();
            }

            // Build the hierarchy
            function build_hierarchy(terms, callback) {
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
                            term.guid = currentTerm.get_id().toString();
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
                tree = sortTree(tree);
                callback(tree);
            }

            // Build the hierarchy
            function recursive_tree(tree, childPath, id) {
                var found = false, index;
                //Loop through current tree and see if top level of term exists
                for (i = 0; !found && i < tree.length; i++) { 
                    if (tree[i].name == childPath[0]) {
                        found = true;
                        index = i;
                    }
                }

                //Shift array, use currentRoot if it doesn't yet exist otherwise discard
                var currentRoot = childPath.shift();
                if (!found) {
                    //Add node to tree if it doesn't currently exist
                    tree.push({
                        name: currentRoot,
                        id: id,
                        children: []
                    });
                    //Get index of new item in array
                    index = tree.length - 1;                                               
                }

                if (childPath.length > 0) {
                    //Recursively work down the tree until a leaf is reached
                    recursiveTree(tree[index].children, childPath);
                }

                return tree;
            }

            // Sort the hierarchy
            function sortTree(tree) {
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
                            var indexA = sortOrder.indexOf(a.guid);
                            var indexB = sortOrder.indexOf(b.guid);

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
                    tree.children[i] = sortTree(tree.children[i]);
                }

                return tree;
            };

            // ### API
            var API = {
                fetchNavigation: function () {
                    return fetch_navigation(Metadata.urls.navigation, function (res) {
                        console.log(JSON.stringify(res));
                    });
                }
            }

            // ### Events
            App.reqres.setHandler('utils:sharepoint:metadata:fetch', function () {
                return API.fetchNavigation();
            });
        }
    });

    return;
})