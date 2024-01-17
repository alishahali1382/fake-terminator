$(document).ready(function() {
	$(".show-course-info").live('click', function(event) {
		event.preventDefault();
		$.get(this.href, function(html){
			$(html).appendTo('body').modal({
				zIndex: 10000,
			});
		});
	});
});