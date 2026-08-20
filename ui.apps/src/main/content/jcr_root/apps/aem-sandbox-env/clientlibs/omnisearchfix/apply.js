(function(window, document, $) {
    "use strict";
    const SEARCH_PATH = "/mnt/overlay/granite/ui/content/shell/omnisearch";

    jQuery(document).bind('ajaxSend', function(event, xhr, params) {
		event.preventDefault();

        // Only process search requests
        if ("GET" === params.type &&
            params.url &&
            params.url.includes(SEARCH_PATH)
           ){

            const url = new URL(params.url, "http://dummy");

            if(url.search){
                let newUrl =  url.pathname + "?";
            	const urlSearchParams = new URLSearchParams(url.search);

                for (const [key, value] of urlSearchParams.entries()) {
                    var isEmpty = (value.length==0);
                    
                    // Check if property predicate has values
                    var hasValue = isPropertyPredicate(key) ? propertyPredicateHasValue(key, urlSearchParams) : true;

                    // Only include fields with values. Explcitly remove breadcrumbs and typehints. 
                    if(!isEmpty && hasValue &&
                       !key.includes(".breadcrumbs") &&
                       !key.endsWith("TypeHint")){

						newUrl += `${key}=${encodeURIComponent(value)}&`;
                    } else {
                    	console.log("Removing unused request parameter '" + key + "' = '" + value +"'");    
                    }
                }

            	if(newUrl.endsWith('&')){
                    newUrl = newUrl.slice(0, -1); // Remove trailing '&'
                }
            	params.url = newUrl;
            }
        }

        return false;
    });
    
    /**
     * Answer whether the passed parameter defines a property predicate
     */
    function isPropertyPredicate(parameterName){
        return parameterName.endsWith("group.property");
    }
    
    /**
     * Answer whether the passed property predicate has a value
     */
    function propertyPredicateHasValue(parameterName, urlSearchParams){

        // Check if any value exists for this property
        for (const [key, value] of urlSearchParams.entries()) {
            if(key.startsWith(parameterName + ".") && key.endsWith("value")){  
            	return true;       
            }
        }    

        // Check if this is defining facets or operator
        if(urlSearchParams.has(parameterName + ".extractFacets") || urlSearchParams.has(parameterName + ".operation")){
            return true;    
        }

        return false;
    }
    
})(window, document, Granite.$);