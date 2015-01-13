var navigation = [];

$(document).ready(function () {
    var scriptbase = _spPageContextInfo.webServerRelativeUrl + "/_layouts/15/";
    $.getScript(scriptbase + "SP.Runtime.js", function () {
        $.getScript(scriptbase + "SP.js", function () {
            $.getScript(scriptbase + "SP.Taxonomy.js", function () {
                var context = SP.ClientContext.get_current(); //Current context                  
                var taxonomySession = SP.Taxonomy.TaxonomySession.getTaxonomySession(context); //Current taxonomy session                   
                var termStores = taxonomySession.get_termStores(); //Collection of term stores
                var groups = termStores.getByName("Managed Metadata Service").get_groups(); //Collection of groups in named term store
                var termSets = groups.getByName("Navigation").get_termSets(); //Collection of term sets in named group
                var terms = termSets.getByName("Master Navigation").getAllTerms(); //Collection of terms in named term set - terms are returned in a flat structure rather than a hierarchy

                context.load(terms); //Explicitly load terms 
                context.executeQueryAsync(function () {
                    var termsEnumerator = terms.getEnumerator();
                    //var navigation = []; //Empty tree
                    while (termsEnumerator.moveNext()) { //Iterate through terms placing them in the tree                                                                                                                
                        var currentTerm = termsEnumerator.get_current();
                        var currentTermPath = currentTerm.get_pathOfTerm().split(';');
                        navigation = recursiveTree(navigation, currentTermPath); //Create tree nodes recursively
                    }
                    navigation = JSON.stringify(navigation);
                    $("#mydiv").append(navigation);
                });
            });
        });
    });
});

function recursiveTree(tree, childPath) {
    var found = false, index;
    for (i = 0; !found && i < tree.length; i++) { //Loop through current tree and see if top level of term exists
        if (tree[i].name == childPath[0]) {
            found = true;
            index = i;
        }
    }
    var currentRoot = childPath.shift();  //Shift array, use currentRoot if it doesn't yet exist otherwise discard
    if (!found) { //Add node to tree if it doesn't currently exist
        tree.push({
            name: currentRoot,
            children: []
        });
        index = tree.length - 1; //Get index of new item in array                                               
    }
    if (childPath.length > 0)
        recursiveTree(tree[index].children, childPath); //Recursively work down the tree until a leaf is reached
    return tree;
}
