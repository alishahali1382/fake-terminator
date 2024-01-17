function calculatePixel(time)
{
	return (Math.floor(time) - 7) * 52 + (time - Math.floor(time) > 0.01 ? 25 : 0)
}

var grid = {
	addedItems: new Array(),
	
	addCourse: function (course, preview, initial) {
		course.events = eval(course.class_times);

		if(course.course_id in grid.addedItems)
			return;
			
		var overlap_count = 0;
		if(!preview)
		{
			if(course.events.length > 0)
			{
				for(var u in grid.addedItems) {
					var c = grid.addedItems[u];
					
					if(c.course_id == course.course_id)
						continue;
						
					var flag = false;
					
					for(var newEvent in course.events) {
						 var events = eval(c.class_times);
						 for(var e in events) {
							if(course.events[newEvent].day == events[e].day &&
								((course.events[newEvent].start >= events[e].start && course.events[newEvent].start < events[e].end) ||
								 (course.events[newEvent].end   > events[e].start && course.events[newEvent].end   <= events[e].end) ||
								 (course.events[newEvent].start <= events[e].start && course.events[newEvent].end   >= events[e].end)))
							{
								overlap_count++;
								flag = true;
								break;
							}
						}
						
						if(flag)
							break;
					}
				}
			}

			grid.addedItems[course.course_id] = course;

		}

		for(var i = 0; i < course.events.length; i++)
		{
			var startY = calculatePixel(course.events[i].start);
			var endY = calculatePixel(course.events[i].end) - 4;
			var height = endY - startY;
			var res = sprintf('<div class="event %s %s" style="top:%dpx;height:%dpx;width:%d%%;" course-id="%s"><a class="del-button"></a><p class="course-id">%s</p><p class="course-title">%s</p><p class="instructor">%s</p></div>', 
					"course-" + course.course_id,
					(preview ? ' event-preview' : 'event-final'), 
					startY,
					height,
					95 - overlap_count*7.5,
					course.course_id,
					course.course_id,
					'<a href="/courses/info/' + course.course_number + '/" class="show-course-info">' + course.name + "</a>",
					course.instructor);

			$("#weekday-" + course.events[i].day).append(res);
		}

		if(!preview && !initial)
		{
			$.ajax({
				url: '/schedule/add/',
				type: 'post',
				data: sprintf('group_id=%d', course.id),
				success: function(data) {
				} 
			});
		}
		
		return "course-" + course.id;
	},

	removeCourse: function (id) {
		$(".course-" + id).remove();
		delete grid.addedItems[id];
		grid.updateUnitsCount(true);		
	},
	
	getCourse: function(id) {
		return $(".course-" + id);
	},
	
	updateUnitsCount: function(doAnimate) {
		var unitsum=0;
		for(c in grid.addedItems) {
			unitsum+=grid.addedItems[c].units;
		}
		if(doAnimate)
		{
			$("#unitsum").fadeOut("normal", function() {
				$("#unitsum").text(unitsum);
			  	$("#unitsum").fadeIn();
			 });
		}
		else
			$("#unitsum").text(unitsum);
	}
};

function get_course_list(dep_id) {
	if(dep_id == "-1")
	{
		var courses = [];
		
		for(u in grid.addedItems)
			courses.push(grid.addedItems[u]);
		
		$("#course-group-list").empty();
		for(i = 0; i < courses.length; i++) {
			$("#course-group-list").append(sprintf('<li><a href="#">%s</a></li>', courses[i].name));
			$("#course-group-list li:last").data('course', courses[i]);
		}
		
		$("#course-group-list li").hover(function(){
			$(".event-preview").remove();
			grid.addCourse($(this).data('course'), true, false);
		}, function () {
			$(".event-preview").remove();
		});
		
		$("#course-group-list li").click(function() {
			grid.addCourse($(this).data('course'), false, false);
			return false;
		});
		
		$("#course-group-list li").simpletip({
			fixed: true,
			position: 'right',
			showEffect: 'none',
			hideEffect: 'none',
			onBeforeShow: function () {
				var course = $(this.getParent()).data('course');
				this.update(sprintf("<b>%s</b> (%s)<br/>استاد: %s<br/>ظرفیت: %d<br/>امتحان: %s<br /><span style='font-size:10px;'>%s</span>", course.name, course.course_id, course.instructor, course.capacity, course.exam_time, course.info));
			}
		});
		
		return;
	}
	else
	{
		$.ajax({
			url: sprintf('/courses/list/%s/', dep_id),
			success: function(data) {
				var courses = eval(data);
				
				$("#course-group-list").empty();
				for(i = 0; i < courses.length; i++) {
					$("#course-group-list").append(sprintf('<li><a href="#">%s</a></li>', courses[i].name));
					$("#course-group-list li:last").data('course', courses[i]);
				}
				
				$("#course-group-list li").hover(function(){
					$(".event-preview").remove();
					grid.addCourse($(this).data('course'), true, false);
				}, function () {
					$(".event-preview").remove();
				});
				
				$("#course-group-list li").click(function() {
					grid.addCourse($(this).data('course'), false, false);
					grid.updateUnitsCount(true);
					return false;
				});
				
				$("#course-group-list li").simpletip({
					fixed: true,
					position: 'right',
					showEffect: 'none',
					hideEffect: 'none',
					onBeforeShow: function () {
						var course = $(this.getParent()).data('course');
						if(course.exam_time !== "") {
							var examConflict = false;
							
							for(var c in grid.addedItems) {
								console.log(grid.addedItems[c]);
								if(grid.addedItems[c].exam_time === course.exam_time) {
									examConflict = true;
									break;
								}
							}
							
							if(!examConflict) {
								this.update(sprintf("<b>%s</b> (%s)<br/>استاد: %s<br/>ظرفیت: %d<br/>امتحان: %s<br /><span style='font-size:10px;'>%s</span>", course.name, course.course_id, course.instructor, course.capacity, course.exam_time, course.info));
							}
							else {
								this.update(sprintf("<b>%s</b> (%s)<br/>استاد: %s<br/>ظرفیت: %d<br/>امتحان: %s<br /><span style='font-size:10px;'>%s</span><br /><span style='font-size:10px;color:red;'>تلاقی امتحان با دروس انتخابی دارد.</span>", course.name, course.course_id, course.instructor, course.capacity, course.exam_time, course.info));
							}
						}
						else {
							this.update(sprintf("<b>%s</b> (%s)<br/>استاد: %s<br/>ظرفیت: %d<br /><span style='font-size:10px;'>%s</span>", course.name, course.course_id, course.instructor, course.capacity, course.info));
						}
					}
				});
			},
		});
	}
}

$("#department-select").change(function (){
	if($(this).attr('value') !== "-2")
		get_course_list($(this).attr('value'));
});

$(".grid").on("mouseenter", ".event", function(){
	$(this).find(".del-button").show();
	$('.course-' + $(this).attr('course-id')).css('z-index', 5000);
});

$(".grid").on("mouseleave", ".event", function(){
	$(this).find(".del-button").hide();
	$('.course-' + $(this).attr('course-id')).css('z-index', 0);
});

$(".grid").on("mouseenter", ".del-button", function(){
	$('.course-' + $(this).parent().attr('course-id')).addClass('event-delete');
});

$(".grid").on("mouseleave", ".del-button", function(){
	$('.event-delete').removeClass('event-delete');
});

$(".grid").on("click", ".del-button", function(){
	var cid=$(this).parent().attr('course-id');
	$('.course-' + $(this).parent().attr('course-id')).fadeOut('fast');

	$.ajax({
		url: '/schedule/remove/',
		type: 'post',
		data: sprintf('course_code=%s', $(this).parent().attr('course-id')),
		success: function(data) {
			grid.removeCourse(cid)
			$('.course-' + cid).remove();
		}
	});
});

$("#loading").hide();

$("#loading").ajaxStart(function() {
	$(this).fadeIn();
}).ajaxStop(function(){
	$(this).fadeOut();
})
