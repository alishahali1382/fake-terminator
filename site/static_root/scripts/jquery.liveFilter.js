/***********************************************************/
/*                    LiveFilter Plugin                    */
/*                      Version: 1.2                       */
/*                      Mike Merritt                       */
/*             	   Updated: Apr 15th, 2010                 */
/***********************************************************/
(function(a){a.fn.liveFilter=function(d){var c=a(this);var g;if(a(this).is("ul")){g="li"}else{if(a(this).is("ol")){g="li"}else{if(a(this).is("table")){g="tbody tr"}}}var e;var b;var f;a("input.filter").keyup(function(){f=a(this).val();e=a(c).find(g+':not(:Contains("'+f+'"))');b=a(c).find(g+':Contains("'+f+'")');if(d=="basic"){e.hide();b.show()}else{if(d=="slide"){e.slideUp(500);b.slideDown(500)}else{if(d=="fade"){e.fadeOut(400);b.fadeIn(400)}}}});jQuery.expr[":"].Contains=function(j,k,h){return jQuery(j).text().toLowerCase().indexOf(h[3].toLowerCase())>=0}}})(jQuery);