var timers = new TimerCollection();

function CreateCurrentDayButton() {
	
	var buttonAllDays = $('<button></button>', {
		'class': 'mdl-button mdl-js-button mdl-js-ripple-effect mdl-button--raised mdl-button--accent',
		id: 'allDaysToggle'
	})
	.css({
		marginRight: '16px'
	})
	.append('Весь месяц');
	
	var buttonToday = $('<button></button>', {
		'class': 'mdl-button mdl-js-button mdl-js-ripple-effect',
		id: 'currentDayToggle'
	})	
	.css({
		marginRight: '16px'
	})
	.append('Сегодня');
	
	
	$('main span.mdl-layout-title')
	.css({
		display: 'flex',
		alignItems: 'center',
		minHeight: '65px'
	})
	.append('&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;')
	.append(buttonAllDays, buttonToday);
	
	componentHandler.upgradeElement(buttonAllDays.get(0));
	componentHandler.upgradeElement(buttonToday.get(0));
}

function SetUpInitialState() {
	var rowsIndex = [];
	var prefix = GetCurrentMonthAndYearPrefix();

	var date = new Date();
	var month = date.getMonth() + 1;
	var year = date.getFullYear();
	
	var currentPeriod = month + '_' + year;
	var storagePeriod = localStorage['currentPeriod'];
	if (storagePeriod) {
		if (storagePeriod != currentPeriod) {
			ShiftLocalStorageData(storagePeriod);
			localStorage['currentPeriod'] = currentPeriod;
		}
	} else {
		localStorage['currentPeriod'] = currentPeriod;
	}


	$('tr[id]:not(.future):not(.trTimeChecker):not(.other):not(.header)').each(
		function() {
			var dayId = $(this).attr('id');
			var index = SetUpDay($(this), prefix);
			rowsIndex[prefix + dayId] = index;
			if (index) {
				localStorage[prefix + dayId] = index;
			} else {
				localStorage.removeItem(prefix + dayId);
			}
		}
	);

	return rowsIndex;
}

/**
 * @return {string}
 */
function GetCurrentMonthAndYearPrefix() {
	var search = window.location.search;
	var objURL = {};

	search.replace(
		new RegExp( "([^?=&]+)(=([^&]*))?", "g" ),
		function( $0, $1, $2, $3 ){
			objURL[ $1 ] = $3;
		}
	);

	var date = objURL.date;
	var realDate = new Date();
	var month = realDate.getMonth() + 1;
	var year = realDate.getFullYear();
	var dateStr = month + '.' + year;

	if (!date || date == dateStr) {
		return '';
	} else {
		return date.replace('.', '_') + '_';
	}

}

function ShiftLocalStorageData(storagePeriod) {
	Object.keys(localStorage)
		.forEach(
			function(key){
				if(key.startsWith('day_')) {
					localStorage[storagePeriod + '_' + key] = localStorage[key];
					localStorage.removeItem(key);
				} else {
					if (key.includes('day_')) {
						localStorage.removeItem(key);
					}
				}
			}
		);
}

/**
 * @return {number}
 */
function SetUpDay(currentRow, prefix) {
	var dayId = currentRow.attr('id');

	var index = 0;
	var tempMainRow, tempSubtaskRow, startTime;

	var headerRow = CreateHeaderRow(dayId, prefix);
	currentRow.after(headerRow);

	var previous = headerRow;

	if (localStorage[prefix + dayId]) {
		index = localStorage[prefix + dayId];
		for(var i = 0; i < index; i++) {
			tempMainRow = CreateTimeCheckerRow(dayId, prefix, i);

			tempMainRow.find('[idtype="inputTask"], [idtype="inputComment"]').each(function(){
				var self = $(this);
				var id = self.attr('id');
				var value = localStorage[id];
				if (value) {
					self.val(value);
				}
			});

			tempMainRow.find('[idtype="inputTime"]').each(function(){
				var self = $(this);
				var id = self.attr('id');
				var value = localStorage[id];
				if (value) {
					if(isFloat(+value) || isInt(+value)) {
						value = ToTime(value);
					}
					localStorage[id] = value;
					self.val(value);
				}
			});

			startTime = localStorage[prefix + dayId + '_startTime' + i + '-0'];

			if (startTime) {
				SetUp_StartTime(tempMainRow, startTime);
				if (dayId != GetCurrentDayId()) {
					localStorage.removeItem(prefix + dayId + '_startTime' + i + '-0');
				}
			}

			previous.after(tempMainRow);
			previous = tempMainRow;

			if (localStorage[prefix + dayId + '_' + i]) {
				var subtaskCount = +localStorage[prefix + dayId + '_' + i];
				for(var j = 1; j < subtaskCount; j++) {
					tempSubtaskRow = CreateTimeCheckerRow(dayId, prefix, i, j);

					tempSubtaskRow.find('[idtype="inputTask"], [idtype="inputComment"]').each(function(){
						var self = $(this);
						var id = self.attr('id');
						var value = localStorage[id];
						if (value) {
							self.val(value);
						}
					});

					tempSubtaskRow.find('[idtype="inputTime"]').each(function(){
						var self = $(this);
						var id = self.attr('id');
						var value = localStorage[id];
						if (value) {
							if(isFloat(+value) || isInt(+value)) {
								value = ToTime(value);
							}
							localStorage[id] = value;
							self.val(value);
						}
					});

					startTime = localStorage[prefix + dayId + '_startTime' + i + '-' + j];

					if (startTime) {
						SetUp_StartTime(tempSubtaskRow, startTime);
						if (dayId != GetCurrentDayId()) {
							localStorage.removeItem(prefix + dayId + '_startTime' + i + '-' + j);
						}
					}

					previous.after(tempSubtaskRow);
					previous = tempSubtaskRow;
				}
				tempMainRow.attr('subtaskcount', subtaskCount);
				tempMainRow.children('td').first().attr('rowspan', subtaskCount);
				tempMainRow.children('td').last().attr('rowspan', subtaskCount);
			}
		}
	}
	var emptyRow = CreateTimeCheckerRow(dayId, prefix, index);
	localStorage.removeItem(prefix + dayId + '_' + index);

	previous.after(emptyRow);
	var otherRow = CreateOtherRow(dayId, prefix);
	emptyRow.after(otherRow);

	return index;
}

function SetUp_StartTime(row, startTime) {
	var dayId = row.attr('dayid');
	var input = row.find('[idtype="inputTime"]');
	
	if (dayId == GetCurrentDayId()) {		
		row.addClass('inProgress');
		input.prop('disabled', true);
		row.find('[idtype=buttonTimeStart]').hide();
		row.find('[idtype=buttonTimeStop]').show();
		
		
		var currentDate = new Date();
		var time = currentDate.getHours() + ":" + currentDate.getMinutes();
		row.find('[idtype=startTime]').text(time);
		var someTime = input.val();
		
		input.val(TCH_SumOfTime(someTime, TCH_DifferenceOfTime(time, startTime)));
		row.attr('currenttime', input.val());
		
		var timer = timers.createTimer();
		timer.bindTo(input.get(0));
		row.attr('timerid', timer.id);
		timer.start();
	} else {
		var time = GetTimeLeftForTheTask(dayId, startTime);
		var inputTime = input;
		var oldValue = inputTime.val();
		if (oldValue) {
			inputTime.val(TCH_SumOfTime(oldValue, time));
		} else {
			inputTime.val(time);
		}			
	}
}

/**
 * @return {string}
 */
function GetTimeLeftForTheTask(dayId, time){

	var mapTimes = function(value) {
		value = value.replace(/ /g, '').replace(/&nbsp;/g, '');
		var regExp = /^([0-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/;

		if (regExp.test(value)) {
			return TCH_SumOfTime('00:00', value);
		} else {
			return '';
		}
	};

	var dayRow = $('#' + dayId);
	var startTimes = dayRow
		.find('td.range.text').first().html()
		.split('<br>')
		.map(mapTimes);
	var finishTimes = dayRow
		.find('td.range.text').last().html()
		.split('<br>')
		.map(mapTimes);

	var result = '00:00';
	time = TCH_SumOfTime('00:00', time);

	for (var i = 0; i < startTimes.length; i++) {
		if (startTimes[i] && finishTimes[i]) {
			if ((time > startTimes[i]) && (time < finishTimes[i])) {
				result = TCH_SumOfTime(result, TCH_DifferenceOfTime(finishTimes[i], time))
			} else {
				if (time <= startTimes[i]) {
					result = TCH_SumOfTime(result, TCH_DifferenceOfTime(finishTimes[i], startTimes[i]))
				}
			}
		}
	}

	return result;
}

function SetTableHeightForTime() {
	var tbody = $("table.full-size tbody");
	var height = $(window).height()
		- $('header.mdl-layout__header').outerHeight(true)
		- $('main.mdl-layout__content.content-wide span.mdl-layout-title').outerHeight(true)
		- $('table.full-size thead').outerHeight(true)
		- 60;

	var conclusion = $('div.conclusion');

	if (tbody.parent().outerWidth(true) + conclusion.outerWidth(true) > $('div.flexParent').width())
	{
		height = height - conclusion.outerHeight(true) - 45;
	}

	if (!CheckIsMonth())
	{
		height = height
			- $('div.buttonDiv').outerHeight(true);
			- 20;
	}

	tbody.outerHeight(height);

	if (tbody.get(0).scrollHeight <= tbody.get(0).clientHeight)
	{
		tbody.css('height', 'auto');
	}
}

function CheckIsMonth() {
	return $('button.resetButton').length <= 0;
}

function GetCurrentDayId() {
	return $('tr[id]:not(.future):not(.trTimeChecker):not(.other):not(.header)').last().attr('id');
}

/** функции подсчета времени *
 * @return {string}
 */
function TCH_SumOfTime(time1, time2)
{	
	if (time1.toString().indexOf("-") > -1 && time2.toString().indexOf("-") > -1)
	{
		return "-" + TCH_SumOfTime(time1.substr(1), time2.substr(1));
	}

	if (time1.toString().indexOf("-") > -1)
	{
		return TCH_DifferenceOfTime(time2, time1.substr(1));
	}

	if (time2.toString().indexOf("-") > -1)
	{
		return TCH_DifferenceOfTime(time1, time2.substr(1));
	}

	// дальше считается для неотрицательных значений
	var position1 = +time1.indexOf(":");
	var position2 = +time2.indexOf(":");
	var hours1 = +time1.substr(0, position1);
	var hours2 = +time2.substr(0, position2);
	var minutes1 = +time1.substr(position1 + 1);
	var minutes2 = +time2.substr(position2 + 1);
	var sumHours = +(hours1 + hours2) + Math.floor((minutes1 + minutes2)/60);
	var sumMinutes = +(minutes1 + minutes2) % 60;
	return sumHours + ":" + TCH_Pad(sumMinutes,2);
}

/**
 * @return {string}
 */
function TCH_Pad(num, size)
{
    var s = num+"";
    while (s.length < size) s = "0" + s;
    return s;
}

/**
 * @return {string}
 */
function TCH_DifferenceOfTime(time1, time2)
{
	if (time1.toString().indexOf("-") > -1 && time2.toString().indexOf("-") > -1)
	{
		return TCH_DifferenceOfTime(time2.substr(1), time1.substr(1));
	}

	if (time1.toString().indexOf("-") > -1)
	{
		return "-" + TCH_SumOfTime(time1.substr(1), time2);
	}

	if (time2.toString().indexOf("-") > -1)
	{
		return TCH_SumOfTime(time1, time2.substr(1));
	}

	// дальше считается для неотрицательных значений
	var position1 = +time1.indexOf(":");
	var position2 = +time2.indexOf(":");
	var hours1 = +time1.substr(0, position1);
	var hours2 = +time2.substr(0, position2);
	var minutes1 = +time1.substr(position1 + 1);
	var minutes2 = +time2.substr(position2 + 1);
	var differenceHours, differenceMinutes;
	if (hours1 < hours2) /*!!!!! < or <= */
	{
		differenceHours = +(hours2 - hours1) + Math.floor((minutes2 - minutes1)/60);
		differenceMinutes = +(minutes2 - minutes1);
		if (minutes2 < minutes1)
		{
			differenceMinutes += 60;
		}
		if (differenceHours.toString().indexOf("-") > -1)
		{
			differenceHours = differenceHours.toString().substr(1);
		}
		else
		{
			if (!(differenceHours == 0 && differenceMinutes == 0))
			{
				differenceHours = "-" + differenceHours;
			}
		}
	}
	if (hours1 >= hours2)
	{
		if (hours1 > hours2)
		{
			differenceHours = +(hours1 - hours2) + Math.floor((minutes1 - minutes2)/60);
			differenceMinutes = +(minutes1 - minutes2);
			if (minutes1 < minutes2)
			{
				differenceMinutes += 60;
			}
		}
		else
		{
			if (minutes1 >= minutes2)
			{
				differenceHours = "00";
				differenceMinutes = +(minutes1 - minutes2);
			}
			else
			{
				differenceHours = "-0";
				differenceMinutes = +(minutes2 - minutes1);
			}
		}
	}
	return differenceHours + ":" + TCH_Pad(differenceMinutes, 2);
}
/*******************************/

function CreateTimeCheckerRow(dayId, prefix, taskIndex, subtaskIndex) {

	var subtaskIndex = subtaskIndex ? subtaskIndex : 0;

	var inputTask = $('<input />', {
		type: 'text',
		idtype: 'inputTask',
		id: prefix + dayId + '_' + 'inputTask' + taskIndex
	})
		.css({
			width: '220px'
		});

	var tdTask = $('<td></td>', {
		colspan: 2
	})
		.append(inputTask);



	var labelStartTime = $('<label></label>', {
		idtype: 'startTime',
		id: prefix + dayId + '_' + 'startTime' + taskIndex + '-' + subtaskIndex
	});

	var tdStartTime = $('<td></td>', {
		'class': 'subtaskTd'
	})
		.css({
			display: 'none'
		})
		.append(labelStartTime);



	var inputTime = $('<input />', {
		type: 'text',
		idtype: 'inputTime',
		id: prefix + dayId + '_' + 'inputTime' + taskIndex + '-' + subtaskIndex
	})
		.css({
			width: '70px'
		});

	var iconTimeStart = $('<i class="material-icons">play_arrow</i>');

	var buttonTimeStart = $('<button></button>', {
		'class': 'mdl-button mdl-js-button mdl-button--icon mdl-js-ripple-effect',
		idtype: 'buttonTimeStart',
		id: prefix + dayId + '_' + 'buttonTimeStart' + taskIndex + '-' + subtaskIndex
	})
		.append(iconTimeStart);

	var iconTimeStop = $('<i class="material-icons">stop</i>');

	var buttonTimeStop = $('<button></button>', {
		'class': 'mdl-button mdl-js-button mdl-button--icon mdl-js-ripple-effect',
		idtype: 'buttonTimeStop',
		id: prefix + dayId + '_' + 'buttonTimeStop' + taskIndex + '-' + subtaskIndex
	})
		.css({
			display: 'none'
		})
		.append(iconTimeStop);


	var tdTime = $('<td></td>', {
		'class': 'subtaskTd'
	}).append(inputTime);

	if (!prefix && dayId == GetCurrentDayId()) {
		tdTime.append(buttonTimeStart, buttonTimeStop);
	}



	var inputComment = $('<input />', {
		type: 'text',
		idtype: 'inputComment',
		id: prefix + dayId + '_' + 'inputComment' + taskIndex + '-' + subtaskIndex
	})
		.css({
			width: '180px'
		});

	var iconAddSubtask = $('<i class="material-icons" >add</i>');

	var buttonAddSubtask = $('<button></button>', {
		'class': 'mdl-button mdl-js-button mdl-button--icon mdl-js-ripple-effect mdl-button--accent',
		idtype: 'buttonAddSubtask',
		id: prefix + dayId + '_' + 'buttonAddSubtask' + taskIndex + '-' + subtaskIndex
	})
		.append(iconAddSubtask);

	var tdComment = $('<td></td>', {
		colspan: 2,
		'class': 'subtaskTd'
	})
		.append(inputComment, buttonAddSubtask);



	var iconCloseSubtask = $('<i class="material-icons" >close</i>');

	var buttonCloseSubtask = $('<button></button>', {
		'class': 'mdl-button mdl-js-button mdl-button--icon mdl-js-ripple-effect',
		idtype: 'buttonCloseSubtask',
		id: prefix + dayId + '_' + 'buttonCloseSubtask' + taskIndex + '-' + subtaskIndex
	})
		.append(iconCloseSubtask);

	var tdCloseSubtask = $('<td></td>', {
		'class': 'time subtaskTd'
	})
		.append(buttonCloseSubtask);



	var iconDeleteTask = $('<i class="material-icons" >delete</i>');

	var buttonDeleteTask = $('<button></button>', {
		'class': 'mdl-button mdl-js-button mdl-button--icon mdl-js-ripple-effect',
		idtype: 'buttonDeleteTask',
		id: prefix + dayId + '_' + 'buttonDeleteTask' + taskIndex
	})
		.append(iconDeleteTask);

	var tdDeleteTask = $('<td></td>', {
		'class': 'time'
	})
		.append(buttonDeleteTask);


	var tr;

	if (subtaskIndex) {
		tr = $('<tr></tr>', {
			'class': 'trTimeChecker subtask',
			idtype: 'trTimeChecker',
			dayid: dayId,
			taskindex: taskIndex,
			subtaskIndex: subtaskIndex,
			id: prefix + dayId + '_' + 'trTimeChecker' + taskIndex + '-' + subtaskIndex
		})
			.append(tdStartTime, tdTime, tdComment, tdCloseSubtask);

	} else {
		tr = $('<tr></tr>', {
			'class': 'trTimeChecker task',
			idtype: 'trTimeChecker',
			dayid: dayId,
			subtaskcount: 1,
			taskindex: taskIndex,
			id: prefix + dayId + '_' + 'trTimeChecker' + taskIndex
		})
			.append(tdTask, tdStartTime, tdTime, tdComment, tdCloseSubtask, tdDeleteTask);
	}

	componentHandler.upgradeElement(buttonTimeStart.get(0));
	componentHandler.upgradeElement(buttonTimeStop.get(0));
	componentHandler.upgradeElement(buttonCloseSubtask.get(0));
	componentHandler.upgradeElement(buttonAddSubtask.get(0));
	componentHandler.upgradeElement(buttonDeleteTask.get(0));

	return tr;
}

function CreateHeaderRow(dayId, prefix) {

	var spanCreateTemplate = $('<span></span>')
	.css({
		paddingRight: '16px'
	})
	.append('Задача');
	
	var iconCreateTemplate = $('<i class="material-icons">list</i>');
	var buttonIdCreateTemplate = prefix + dayId + '_' + 'buttonCreateTemplate';	
	var buttonCreateTemplate = $('<button></button>', {
		'class': 'mdl-button mdl-js-button mdl-button--icon mdl-js-ripple-effect',
		idtype: 'buttonCreateTemplate',
		id: buttonIdCreateTemplate
	})
	.css({
		marginBottom: '2px'
	})
	.append(iconCreateTemplate);	
	
	var tooltipCreateTemplate = $('<div class="mdl-tooltip" for="' + buttonIdCreateTemplate + '">Создать шаблон</div>');	
	
	var iconSaveTemplate = $('<i class="material-icons">save</i>');
	var buttonIdSaveTemplate = prefix + dayId + '_' + 'buttonSaveTemplate';	
	var buttonSaveTemplate = $('<button></button>', {
		'class': 'mdl-button mdl-js-button mdl-button--icon mdl-js-ripple-effect',
		idtype: 'buttonSaveTemplate',
		id: buttonIdSaveTemplate
	})
	.css({
		marginBottom: '2px',
		display: 'none'
	})
	.append(iconSaveTemplate);	
	
	var tooltipSaveTemplate = $('<div class="mdl-tooltip" for="' + buttonIdSaveTemplate + '">Сохранить выбранные</div>');	
	
	var iconUploadTemplate = $('<i class="material-icons">file_upload</i>');
	var buttonIdUploadTemplate = prefix + dayId + '_' + 'buttonUploadTemplate';	
	var buttonUploadTemplate = $('<button></button>', {
		'class': 'mdl-button mdl-js-button mdl-button--icon mdl-js-ripple-effect',
		idtype: 'buttonUploadTemplate',
		id: buttonIdUploadTemplate
	})
	.css({
		marginBottom: '2px'
	})
	.append(iconUploadTemplate);	
	
	var tooltipUploadTemplate = $('<div class="mdl-tooltip" for="' + buttonIdUploadTemplate + '">Загрузить шаблон</div>');	


	var tdTask = $('<td></td>', {
		colspan: 2
	}).append(spanCreateTemplate)
	.append(buttonCreateTemplate, tooltipCreateTemplate)
	.append(buttonSaveTemplate, tooltipSaveTemplate)
	.append(buttonUploadTemplate, tooltipUploadTemplate);

	var divTitleTime = $('<div></div>')
	.append('Потраченное время <br>чч:мм, ч.мм');

	var tdTime = $('<td></td>', {
	})
	.css({
		display: 'flex'
	})
	.append(divTitleTime);

	var tdComment = $('<td></td>', {
		colspan: 2
	}).append('Подзадача/комментарий');

	var tdDeleteSubtask = $('<td></td>', {
		'class': 'time'
	}).append('Удалить<br>подзадачу');

	var tdDeleteTask = $('<td></td>', {
		'class': 'time'
	}).append('Удалить<br>задачу');

	componentHandler.upgradeElement(buttonCreateTemplate.get(0));
	componentHandler.upgradeElement(buttonSaveTemplate.get(0));
	componentHandler.upgradeElement(buttonUploadTemplate.get(0));
	
	return $('<tr></tr>', {
		'class': 'header',
		idtype: 'header',
		dayid: dayId,
		id: prefix + dayId + '_header'
	}).append(tdTask, tdTime, tdComment, tdDeleteSubtask, tdDeleteTask);
}

function CreateOtherRow(dayId, prefix) {

	var labelTask = $('<label></label>', {
		idtype: 'labelTask',
		id: dayId + '_other_labelTask'
	})
	.css({
		width: '220px'
	})
	.append('Оставшееся время');

	var tdTask = $('<td></td>', {
		colspan: 2
	})
	.append(labelTask);

	var labelTime = GetTimeForOtherLabel(dayId)

	var labelTimeUsual = $('<label></label>', {
		idtype: 'labelTime',
		id: dayId + '_other_labelTime_usual',
		'class': 'usualTime'
	})
	.css({
		width: '70px'
	})
	.append(ToTime(labelTime));
	
	var labelTimeDecimal = $('<label></label>', {
		idtype: 'labelTime',
		id: dayId + '_other_labelTime_decimal',
		'class': 'decimalTime'
	})
	.css({
		width: '70px',
		display: 'none'
	})
	.append(labelTime);
	
	var tdTime = $('<td></td>', {
		'class': 'subtaskTd'
	})
	.append(labelTimeUsual, labelTimeDecimal);

	var tdComment = $('<td></td>', {
		colspan: 4
	})
	.append('');

	return $('<tr></tr>', {
		'class': 'other',
		idtype: 'other',
		dayid: dayId,
		taskindex: 'other',
		id: prefix + dayId + '_other'
	})
	.append(tdTask, tdTime, tdComment);
}

/**
 * @return {string}
 */
function GetTimeForOtherLabel(dayId) {
	var prefix = GetCurrentMonthAndYearPrefix();
	var reportTime = +$('#' + dayId).find('td.time').last().find('span.decimalTime').text();

	var inputs = $('[idtype=inputTime][id^="' + prefix + dayId + '_"]').toArray();
	var regExp = /^([0-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/;
	
	var times = inputs.map(
		function(input) {
			var time = $(input).val();
			if (regExp.test(time)) {
				time = ToDecimal(time);
			} else {
				if (!isFloat(+time) && !isInt(+time)) {
					time = 0;
				}
			}
			
			return time;
		}
	);
	

	var result = times.reduce(function(sum, current) {
		return +sum + +current;
	}, 0);

	return ((reportTime - result).toFixed(2)*1).toString();
}

function isFloat(n){
    return Number(n) === n && n % 1 !== 0;
}

function isInt(n){
    return Number(n) === n && n % 1 === 0;
}

function CheckRowsNumber(lastRowIndex, dayId) {
	var prefix = GetCurrentMonthAndYearPrefix();

	if (CheckIfAnyInputHasVal(dayId, prefix, lastRowIndex) && $('#' + prefix + dayId + '_' + 'trTimeChecker' + (lastRowIndex + 1)).length <= 0)
	{
		var selector = '#' + prefix + dayId + '_' + 'trTimeChecker' + lastRowIndex;
		var lastSubtaskIndex = +$(selector).attr('subtaskcount') - 1;
		if (lastSubtaskIndex != 0) {
			selector += '-' + lastSubtaskIndex;
		}
		$(selector).after(CreateTimeCheckerRow(dayId, prefix, ++lastRowIndex));
	} else {
		for (var i = 0; i < lastRowIndex; i++) {
			var currentRow = $('#' + prefix + dayId + '_' + 'trTimeChecker' + i);
			if (!currentRow) continue;

			if (!CheckIfAnyInputHasVal(dayId, prefix, i)) {
				ClearLocalStorageInputValueForRow(currentRow);
				localStorage.removeItem(prefix + dayId + '_' + i);
				
				var timerId = currentRow.attr('timerid');
				if(timerId) {
					timers.getTimer(+timerId).stop();
					delete timers.getTimers()[+timerId];
				}
				
				$('[dayid=' + dayId + '][taskindex=' + i + ']').remove();
			}
		}
	}

	return lastRowIndex;
}

/**
 * @return {boolean}
 */
function CheckIfAnyInputHasVal(dayId, prefix, taskIndex) {
	var subtaskCount = $('#' + prefix + dayId + '_' + 'trTimeChecker' + taskIndex).attr('subtaskcount');

	var isAnyInputHasVal = ($('#' + prefix + dayId + '_' + 'inputTask' + taskIndex).val() != '');

	for (var i = 0; i < subtaskCount; i++) {
		var label = $('#' + prefix + dayId + '_' + 'startTime' + taskIndex + '-' + i);
		var labelText = label.text();
		isAnyInputHasVal = isAnyInputHasVal
			|| (labelText != '')
			|| ($('#' + prefix + dayId + '_' + 'inputComment' + taskIndex + '-' + i).val() != '')
			|| ($('#' + prefix + dayId + '_' + 'inputTime' + taskIndex + '-' + i).val() != '');
	}

	return isAnyInputHasVal;
}

function ClearLocalStorageInputValueForRow(row, shouldTaskBeCleared) {
	row.find('[idtype="inputTask"], [idtype="inputComment"], [idtype="inputTime"], [idtype="startTime"]')
	.each(
		function() {
			var self = $(this);
			if (self.attr('idtype') == 'inputTask' && shouldTaskBeCleared)
				self.val('');
			if (self.is('input')) {
				if (((self.attr('idtype') == 'inputTask') && shouldTaskBeCleared) || (self.attr('idtype') != 'inputTask')) {
					self.val('');
				}
			} else {
				self.text('');
			}
			var id = self.attr('id');
			localStorage.removeItem(id);
		}
	);
}

/**
 * @return {number}
 */
function RecountIds(dayId) {
	var rowsIndex = 0;
	var prefix = GetCurrentMonthAndYearPrefix();

	$('.task[idtype="trTimeChecker"][dayid=' + dayId + ']').each(
		function() {

			var row = $(this);
			var dayId = row.attr('dayid');

			row.find('[idtype]').each(function() {
				var item = $(this);
				var oldId = item.attr('id');
				var idType = item.attr('idtype');
				var id = prefix + dayId + '_' + idType + rowsIndex;
				if (item.parent().hasClass('subtaskTd')) {
					id += '-0';
				}
				item.attr('id', id);

				if ((item.is('input') || item.is('label'))&& localStorage[oldId] && oldId != id) {
					localStorage[id] = localStorage[oldId];
					localStorage.removeItem(oldId);
				}
			});

			var oldTaskIndex = row.attr('taskindex');
			var oldSubtaskCountId = prefix + dayId + '_' + oldTaskIndex;
			var newSubtaskCountId = prefix + dayId + '_' + rowsIndex;
			if (localStorage[oldSubtaskCountId] && oldSubtaskCountId != newSubtaskCountId) {
				localStorage[newSubtaskCountId] = localStorage[oldSubtaskCountId];
				localStorage.removeItem(oldSubtaskCountId);
			}

			row.attr('id', prefix + dayId + '_' + 'trTimeChecker' + rowsIndex);
			row.attr('taskindex', rowsIndex);
			var subtaskCount = $(this).attr('subtaskcount');
			for (var i = 1; i < subtaskCount; i++) {
				RecountIdsForSubtasksRows(+oldTaskIndex, dayId, +rowsIndex );
			}

			rowsIndex++;
		}
	);

	return --rowsIndex;
}

/**
 * @return {number}
 */
function RecountIdsForSubtasksRows(taskIndex, dayId, newTaskIndex) {
	var subtaskIndex = 0;
	var realIndex = (newTaskIndex === undefined) ? taskIndex : newTaskIndex;
	var prefix = GetCurrentMonthAndYearPrefix();

	$('[dayid=' + dayId + '][idtype=trTimeChecker][taskindex=' + taskIndex + ']').each(
		function() {
			$(this).find('.subtaskTd [idtype]').each(function() {
				var oldId = $(this).attr('id');
				var idType = $(this).attr('idtype');
				var id = prefix + dayId + '_' + idType + realIndex + '-' + subtaskIndex;
				$(this).attr('id', id);

				if ($(this).is('input') && localStorage[oldId] && oldId != id) {
					localStorage[id] = localStorage[oldId];
					localStorage.removeItem(oldId);
				}
			});

			$(this).attr('taskindex', realIndex);

			if ($(this).hasClass('subtask')) {
				$(this).attr('id', prefix + dayId + '_' + 'trTimeChecker' + realIndex + '-' + subtaskIndex);
				$(this).attr('subtaskindex', subtaskIndex);
			}

			subtaskIndex++;
		}
	);

	return subtaskIndex;
}

function ShiftSubtask(taskIndex, dayId, prefix) {
	var mainRow = $('#' + prefix + dayId + '_' + 'trTimeChecker' + taskIndex);
	var subtaskCount = mainRow.attr('subtaskcount');
	var previousRow = mainRow;

	ClearLocalStorageInputValueForRow(mainRow);

	for (var i = 1; i < subtaskCount; i++) {

		var currentRow = $('#' + prefix + dayId + '_' + 'trTimeChecker' + taskIndex + '-' + i);
		var previousSubtaskTds = previousRow.find('td.subtaskTd');
		currentRow.find('td.subtaskTd').each(function(index) {			
			var previousItem, currentItem;
			
			var isInput = $(this).children().first().is('input');
			var isLabel = $(this).children().first().is('label');
			
			if(isInput || isLabel) {
				if (isInput) {
					previousItem = $(previousSubtaskTds[index]).children('input');
					currentItem = $(this).children('input');
					previousItem.val(currentItem.val());
				}
				if (isLabel) {
					previousItem = $(previousSubtaskTds[index]).children('label');
					currentItem = $(this).children('label');
					var text = currentItem.text();
					previousItem.text(text);
					if (text) {
						var currentParent = currentItem.parent().parent();
						var previousParent = previousItem.parent().parent();
						
						currentParent.removeClass('inProgress');
						currentParent.find('[idtype="buttonTimeStart"]').show();
						currentParent.find('[idtype="buttonTimeStop"]').hide();
						var timerId = currentParent.attr('timerid');
						currentParent.removeAttr('timerid');
						
						previousParent.addClass('inProgress');						
						previousParent.find('[idtype="buttonTimeStart"]').hide();
						previousParent.find('[idtype="buttonTimeStop"]').show();		
						previousParent.attr('timerid', timerId);
						timers.getTimer(+timerId).bindTo(previousParent.find('[idtype=inputTime]'));						
					}
				}
				
				var previousId = previousItem.attr('id');
				var currentId = currentItem.attr('id');

				if (localStorage[currentId] && previousId != currentId) {
					localStorage[previousId] = localStorage[currentId];
					localStorage.removeItem(currentId);
				} else {
					localStorage.removeItem(previousId);
				}
			}
		});

		previousRow = currentRow;
	}

	ClearLocalStorageInputValueForRow(currentRow);
	currentRow.remove();
}

/**
 * @return {number}
 */
function ToDecimal(time) {
	var regExp = /^([0-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/;
	
	if (!(regExp.test(time) || regExp.test(time.substr(1))))
	{
		return 0;
	}
	
	var isNegative = (time.indexOf('-') == 0);
	
	var position = +time.indexOf(":");
	var hours = isNegative ? +time.substr(1, position - 1) : +time.substr(0, position);
	var minutes = +time.substr(position + 1);
	var decimalMinutes = (+(+ minutes/60)).toFixed(2);
	var stringMinutesPosition = decimalMinutes.indexOf('.');
	var stringMinutes = decimalMinutes.substr(stringMinutesPosition + 1);
	
	return +((isNegative ? '-' : '') + hours + '.' + stringMinutes);
}

/**
 * @return {string}
 */
function ToTime(decimal) {
	
	var position1 = +decimal.indexOf(".");
	var position2 = +decimal.indexOf(",");
	if (position1 < 0 && position2 < 0) {
		if (Number.isInteger(+decimal)) {
			return decimal + ':00';
		} else {
			return '00:00';
		}			
	}
	
	decimal = (+decimal).toFixed(2);
	
	var position = position1 >= 0 ? position1 : position2;
	var hours = +decimal.substr(0, position);
	var minutes = +decimal.substr(position + 1, 2);
	if (!(Number.isInteger(+hours) && Number.isInteger(+minutes) && minutes >= 0))
	{
		return '00:00';
	}
	var realMinutes = +(+minutes*60/100).toFixed();

	return hours + ':' + TCH_Pad(realMinutes, 2);
}

function RoundTimeForDay(dayId) {
	var prefix = GetCurrentMonthAndYearPrefix();
	var inputs = $('[idtype=inputTime][id^="' + prefix + dayId + '_"]').toArray();
	
	var regExp = /^([0-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/;
	
	var times = inputs.map(
		function(input) {
			var time = $(input).val();
			if (regExp.test(time)) {
				time = ToDecimal(time);
			}
			
			return time;
		}
	);
	
	for (var i = 0; i < inputs.length; i++) {
		if (!times[i])
			continue;
		var value = ((Math.round(+times[i] * 4) / 4).toFixed(2)*1).toString();
		
		var input = inputs[i];		
		$(input).val(value);
		var id = $(input).attr('id');
		localStorage[id] = value;
	}
}

function RoundDecimalToQuarters(decimal) {
	return ((Math.round(decimal * 4) / 4).toFixed(2)*1).toString();
}


function CreateTemplateMenu(dayId) {
	$('.trTimeChecker.task[dayid="' + dayId + '"] input[idtype=inputTask]').each(
		function(index) {
			var id = $(this).attr('id') + '_' + index;
			
			var checkbox = $('<input />', {
				type: 'checkbox',
				'class': 'mdl-checkbox__input templateMenuCheckbox ' + dayId,
				id: id
			});
			
			var label = $('<label></label>', {
				'class': 'mdl-checkbox mdl-js-checkbox mdl-js-ripple-effect templateMenuLabel ' + dayId,
				'for': id
			})
			.css({
				width: '0px'
			})
			.append(checkbox);
			
			$(this).before(label);
			
			componentHandler.upgradeElement(label.get(0));
		}
	);
}

function SaveTemplate(dayId) {		
	var taskList = [];
	
	$('.' + dayId + '.templateMenuCheckbox:checked').each(
		function() {
			var currentRow = $(this).parent().parent();
			var task = currentRow.find('[idtype=inputTask]').val();
			if (task) {
				taskList[taskList.length] = task;
			}
		}
	);
	
	var length = taskList.length;
	
	if(length) {	
		for(var i = 0; i < length; i++) {
			localStorage['templateTask' + i] = taskList[i];
		}
		
		var oldNumber = localStorage['templateNumber'];
		if (oldNumber) {
			for(var j = length; j < oldNumber; j++) {
				localStorage.removeItem('templateTask' + j);
			}
		}
		
		localStorage['templateNumber'] = length;
	}
}

function UploadTemplate(dayId, taskLastIndex) {	
	var	prefix = GetCurrentMonthAndYearPrefix();
	var count = localStorage['templateNumber'];
	if(!count) {
		return;
	}
	
	var lastRow = $('.trTimeChecker[dayid=' + dayId + '][taskindex=' + taskLastIndex + ']').last();
	var previousRow = lastRow.prev();
	lastRow.remove();
	
	for (var i = 0; i < count; i++, taskLastIndex++) {
		var task = localStorage['templateTask' + i];
		var newRow = CreateTimeCheckerRow(dayId, prefix, taskLastIndex);
		var input = newRow.find('[idtype=inputTask]');
		input.val(task);
		localStorage[input.attr('id')] = task;
		
		previousRow.after(newRow);
		previousRow = newRow;
	}
	
	return taskLastIndex - 1;
}

function DeleteMenu(dayId) {
	$('.templateMenuLabel.' + dayId).remove();
}


function TimerCollection() {
  
  this.timers = [];
  
}

TimerCollection.prototype.getTimers = function() { return this.timers; };
TimerCollection.prototype.getTimer = function(index) { return this.timers[index]; };

TimerCollection.prototype.createTimer = function() { 
  
  var timer = new Timer(this.timers.length);

  this.timers.push(timer); 
  
  return timer;
};


function Timer(id, changeInnerText) {
  this.id = id;
  
  this.changeInnerText = changeInnerText;
  
  this.seconds = 0;
  
  this.timeout = null;
  
  this.ticks = false;
  
  this.tickCallback = function() { console.log('Timer ', this.id, ' tick'); }
}

Timer.prototype.start = function() {
	
	var timer = this;
	var currentDate = new Date();
	var currentTime = currentDate.getHours() + ':' + currentDate.getMinutes();
  
	var changingProperty = this.changeInnerText ? "innerText" : "value";
	
	if(!timer.binding[changingProperty]) {
		timer.binding[changingProperty] = '0:00';
	}
  
	var startingTime = TCH_DifferenceOfTime(currentTime, timer.binding[changingProperty]);  
  
	timer.ticks = true;
  
	timer.timeout = setInterval(function() { 
		var currentDate = new Date();
		var currentTime = currentDate.getHours() + ':' + currentDate.getMinutes();
		var newValue = TCH_DifferenceOfTime(currentTime, startingTime);
	
		if (timer.binding[changingProperty] != newValue) {
			timer.binding[changingProperty] = newValue;
		}
	}, 1000);
}

Timer.prototype.stop = function() {
  this.ticks = false;
  clearInterval(this.timeout);
}

Timer.prototype.onTick = function(callback) {
  this.tickCallback = callback;
}

Timer.prototype.toggle = function() {
  
  if (this.ticks) {
    this.stop();
  } else {
    this.start();
  }
}

Timer.prototype.bindTo = function(el) {
  this.binding = el;
}


function ReportedTimeTimer() {  
	this.seconds = 0;
  
	this.timeout = null;
  
	this.ticks = false;
  
	var dayId = GetCurrentDayId();  
	this.otherLabelUsual =  $('#' + dayId + '_other_labelTime_usual');
	this.otherLabelDecimal =  $('#' + dayId + '_other_labelTime_decimal');
	this.reportedSpanUsual =  $('tr#' + dayId + ' td.time span.usualTime').first();
	this.reportedSpanDecimal =  $('tr#' + dayId + ' td.time span.decimalTime').first();
	this.timeForToday =  $('tr#' + dayId + ' td.time').first();
  
	this.tickCallback = function() { console.log('Timer ', this.id, ' tick'); }
}

ReportedTimeTimer.prototype.start = function() {
	
	var timer = this;
	var currentDate = new Date();
	var currentTime = currentDate.getHours() + ':' + currentDate.getMinutes();
	var dayId = GetCurrentDayId();  
	
	var startingTime = TCH_DifferenceOfTime(currentTime, timer.timeForToday.text());  
  
	timer.ticks = true;
  
	timer.timeout = setInterval(function() { 
		var currentDate = new Date();
		var currentTime = currentDate.getHours() + ':' + currentDate.getMinutes();
		var newValue = TCH_DifferenceOfTime(currentTime, startingTime);
	
		if (timer.timeForToday.text() != newValue) {
			timer.timeForToday.text(newValue);
			var reportedTime = RoundDecimalToQuarters(ToDecimal(TCH_DifferenceOfTime(newValue, '00:30')));
			timer.reportedSpanUsual.text(ToTime(reportedTime));
			timer.reportedSpanDecimal.text(reportedTime);
			var labelTime = GetTimeForOtherLabel(dayId);
			timer.otherLabelUsual.text(ToTime(labelTime));
			timer.otherLabelDecimal.text(labelTime);
		}
	}, 1000);
}

ReportedTimeTimer.prototype.stop = function() {
  this.ticks = false;
  clearInterval(this.timeout);
}

ReportedTimeTimer.prototype.onTick = function(callback) {
  this.tickCallback = callback;
}




$(document).ready ( function() {
	var prefix = GetCurrentMonthAndYearPrefix();
	
	var prefixIndex = prefix.indexOf('_');
	var prefixMonth = prefix.substr(0, prefixIndex);
	var prefixYear = prefix.substr(prefixIndex + 1, 4);

	var date = new Date();
	var month = date.getMonth() + 1;
	var year = date.getFullYear();
	
	var previous = new Date();
	previous.setDate(1);
	previous.setMonth(previous.getMonth()-1);
	
	var previousMonth = previous.getMonth() + 1;
	var previousYear = previous.getFullYear();

	if(prefix && !((year == prefixYear && month == prefixMonth) || (previousYear == prefixYear && previousMonth == prefixMonth))) {
		return;
	}	
	
	var rowsIndex = SetUpInitialState();

	var shouldDecimalTimeBeShown = false;
	
	$('.trTimeChecker, .other, .header').hide();
	
	var reportedTimeTimer = new ReportedTimeTimer();
	reportedTimeTimer.start();

	if(!prefix) {
		CreateCurrentDayButton();
	}
	
	
	SetTableHeightForTime();
	
	$('.mdl-tooltip').each(function() {
		componentHandler.upgradeElement(this);	
	});

	$(document).on('input', '[idtype="inputTask"], [idtype="inputComment"], [idtype="inputTime"]',
		function()
		{
			var regExp = /^([0-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/;
			var value = $(this).val();
			var id = $(this).attr('id');
			var idType = $(this).attr('idtype');


			if($(this).attr('idtype') == 'inputTime') {
				if (!value) {
					localStorage.removeItem(id);
				} else {
					if (regExp.test(value)) {
						localStorage[id] = value;
					} else {
						if (isInt(+value) || isFloat(+value)) {
							localStorage[id] = ToTime(value);
						}
					}
				}
			} else {
				if (value) {
					localStorage[id] = value;
				} else {
					localStorage.removeItem($(this).attr('id'));
				}
			}
			var mainTr = $(this).parent().parent();
			var dayId = mainTr.attr('dayid');
			rowsIndex[prefix + dayId] = CheckRowsNumber(rowsIndex[prefix + dayId], dayId);
			rowsIndex[prefix + dayId] = RecountIds(dayId);
			if (rowsIndex[prefix + dayId]) {
				localStorage[prefix + dayId] = rowsIndex[prefix + dayId];
			} else {
				localStorage.removeItem(prefix + dayId);
			}
			
			if(!$(this).is(':visible')) {
				$('.trTimeChecker.task[dayid="' + dayId + '"]').last().find('[idtype="' + idType + '"]').focus();
			}
			
			var labelTime = GetTimeForOtherLabel(dayId);
			$('#' + prefix + dayId + '_other_labelTime_usual').text(ToTime(labelTime));
			$('#' + prefix + dayId + '_other_labelTime_decimal').text(labelTime);
			
			SetTableHeightForTime();
		}
	);

	$(document).on('click', '[idtype="buttonDeleteTask"]',
		function() {

			var mainTr = $(this).parent().parent();
			var dayId = mainTr.attr('dayid');
			var idType = mainTr.attr('idtype');
			var taskIndex = mainTr.attr('taskindex');
			
			
			var timerId = mainTr.attr('timerid');
			if (timerId) {
				timers.getTimer(+timerId).stop();
				delete timers.getTimers()[+timerId];
			}

			$('.subtask[dayid=' + dayId + '][idtype=' + idType + '][taskindex=' + taskIndex + ']').each(function() {
				timerId = $(this).attr('timerid');
				if (timerId) {
					timers.getTimer(+timerId).stop();
					delete timers.getTimers()[+timerId];
				}
				ClearLocalStorageInputValueForRow($(this));
			}).remove();

			mainTr.children('td').first().attr('rowspan', 1);
			mainTr.children('td').last().attr('rowspan', 1);
			mainTr.attr('subtaskcount', 1);

			ClearLocalStorageInputValueForRow(mainTr, true);
			localStorage.removeItem(prefix + dayId + '_' + taskIndex);

			if (rowsIndex[prefix + dayId] == taskIndex) {
				SetTableHeightForTime();
				return;
			}

			mainTr.remove();

			rowsIndex[prefix + dayId] = CheckRowsNumber(rowsIndex[prefix + dayId], dayId);
			rowsIndex[prefix + dayId] = RecountIds(dayId);
			if (rowsIndex[prefix + dayId]) {
				localStorage[prefix + dayId] = rowsIndex[prefix + dayId];
			} else {
				localStorage.removeItem(prefix + dayId);
			}
			
			var labelTime = GetTimeForOtherLabel(dayId);
			$('#' + prefix + dayId + '_other_labelTime_usual').text(ToTime(labelTime));
			$('#' + prefix + dayId + '_other_labelTime_decimal').text(labelTime);
			
			SetTableHeightForTime();
		}
	);

	$(document).on('click', '[idtype="buttonAddSubtask"]',
		function() {
			var tr = $(this).parent().parent();
			var dayId = tr.attr('dayid');
			var taskIndex = +tr.attr('taskindex');

			var mainRow = $('#' + prefix + dayId + '_' + 'trTimeChecker' + taskIndex);
			var newSubtaskIndex = +mainRow.attr('subtaskcount');
			tr.after(CreateTimeCheckerRow(dayId, prefix, taskIndex, newSubtaskIndex));

			var subtaskCount = newSubtaskIndex + 1;

			mainRow.attr('subtaskcount', subtaskCount);
			mainRow.children('td').first().attr('rowspan', subtaskCount);
			mainRow.children('td').last().attr('rowspan', subtaskCount);
			localStorage[prefix + dayId + '_' + taskIndex] = subtaskCount;

			RecountIdsForSubtasksRows(taskIndex, dayId);

			SetTableHeightForTime();
		}
	);

	$(document).on('click', '[idtype="buttonCloseSubtask"]',
		function() {
			var currentRow = $(this).parent().parent();
			var dayId = currentRow.attr('dayid');
			var taskIndex = currentRow.attr('taskindex');

			var mainRow = $('#' + prefix + dayId + '_' + 'trTimeChecker' + taskIndex);

			
			var timerId = currentRow.attr('timerid');
			if (timerId) {
				timers.getTimer(+timerId).stop();
				delete timers.getTimers()[+timerId];
			}
			
			currentRow.removeClass('inProgress');
			currentRow.removeAttr('timerid');
			currentRow.find('[idtype="buttonTimeStart"]').show();
			currentRow.find('[idtype="buttonTimeStop"]').hide();
			
			
			currentRow.find('[idtype="inputComment"], [idtype="inputTime"]').val("");
			currentRow.find('[idtype="inputComment"], [idtype="inputTime"]').val("");
			ClearLocalStorageInputValueForRow(currentRow);

			var subtaskCount = +mainRow.attr('subtaskcount');

			var otherLineUsual = $('#' + prefix + dayId + '_other_labelTime_usual');
			var otherLineDecimal = $('#' + prefix + dayId + '_other_labelTime_decimal');
			var labelTime;

			if (subtaskCount == 1) {
				rowsIndex[prefix + dayId] = CheckRowsNumber(rowsIndex[prefix + dayId], dayId);
				rowsIndex[prefix + dayId] = RecountIds(dayId);
				if (rowsIndex[prefix + dayId]) {
					localStorage[prefix + dayId] = rowsIndex[prefix + dayId];
				}				
				
				labelTime = GetTimeForOtherLabel(dayId);				
				otherLineUsual.text(ToTime(labelTime));
				otherLineDecimal.text(labelTime);
				
				SetTableHeightForTime();
				return;
			}

			if (currentRow.attr('id') == (prefix + dayId + '_' + 'trTimeChecker' + taskIndex)) {
				ShiftSubtask(taskIndex, dayId, prefix);
			} else {
				currentRow.remove();
			}

			var newSubtaskCount = subtaskCount - 1;

			mainRow.attr('subtaskcount', newSubtaskCount);
			mainRow.children('td').first().attr('rowspan', newSubtaskCount);
			mainRow.children('td').last().attr('rowspan', newSubtaskCount);
			localStorage[prefix + dayId + '_' + taskIndex] = newSubtaskCount;

			RecountIdsForSubtasksRows(+taskIndex, dayId);

			rowsIndex[prefix + dayId] = CheckRowsNumber(rowsIndex[prefix + dayId], dayId);
			rowsIndex[prefix + dayId] = RecountIds(dayId);
			if (rowsIndex[prefix + dayId]) {
				localStorage[prefix + dayId] = rowsIndex[prefix + dayId];
			} else {
				localStorage.removeItem(prefix + dayId);
			}

			labelTime = GetTimeForOtherLabel(dayId);				
			otherLineUsual.text(ToTime(labelTime));
			otherLineDecimal.text(labelTime);
			
			SetTableHeightForTime();
		}
	);
	
	$(document).on('click', '[idtype="buttonTimeStart"]',
		function() {
			var currentDate = new Date();
			var time = currentDate.getHours() + ":" + currentDate.getMinutes();

			var mainRow = $(this).parent().parent();
			mainRow.find('[idtype=startTime]').text(time);
			mainRow.find('[idtype=inputTime]').prop('disabled', true);
			

			var dayId = mainRow.attr('dayid');
			var taskIndex = mainRow.attr('taskindex');
			var subtaskIndex = mainRow.attr('subtaskindex') ? mainRow.attr('subtaskindex') : 0;
			var input = mainRow.find('[idtype=inputTime]');
			mainRow.attr('currenttime', input.val());

			localStorage[prefix + dayId + '_' + 'startTime' + taskIndex + '-' + subtaskIndex] = time;

			$(this).hide();
			var stopId = '#' + $(this).attr('id').replace('Start', 'Stop');
			$(stopId).show();
			mainRow.addClass('inProgress');

			rowsIndex[prefix + dayId] = CheckRowsNumber(rowsIndex[prefix + dayId], dayId);
			rowsIndex[prefix + dayId] = RecountIds(dayId);
			
			if (rowsIndex[prefix + dayId]) {
				localStorage[prefix + dayId] = rowsIndex[prefix + dayId];
			} else {
				localStorage.removeItem(prefix + dayId);
			}
			
			
			var timerId = mainRow.attr('timerid');
			var timer;
			if (timerId) {
				timer = timers.getTimer(+timerId);
			} else {
				timer = timers.createTimer();
				timer.bindTo(input.get(0));
				mainRow.attr('timerid', timer.id);
			}
			
			timer.start();
			
			SetTableHeightForTime();
		}
	);

	$(document).on('click', '[idtype="buttonTimeStop"]',
		function() {
			var currentDate = new Date();
			var time = currentDate.getHours() + ":" + currentDate.getMinutes(); 

			var mainRow = $(this).parent().parent();
			var dayId = mainRow.attr('dayid');
			mainRow.find('[idtype=inputTime]').prop('disabled', false);
			
			var timerId = mainRow.attr('timerid');
			if(timerId) {
				timers.getTimer(+timerId).stop();
			}

			var taskIndex = mainRow.attr('taskindex');
			var subtaskIndex = mainRow.attr('subtaskindex') ? mainRow.attr('subtaskindex') : 0;

			var input = mainRow.find('[idtype=inputTime]');
			var startTime = mainRow.find('[idtype=startTime]');
			
			var regExp = /^([0-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/;	
			var currentTime = mainRow.attr('currenttime') || '0';
			mainRow.removeAttr('currenttime');
			
			
			if (!regExp.test(currentTime)) {
				currentTime = ToTime(currentTime);
				if (!regExp.test(currentTime)) {
					currentTime = '';
				}
			}
			
			var workedTime;			
			
			if (currentTime) {
				workedTime = TCH_SumOfTime(TCH_DifferenceOfTime(time, startTime.text()), currentTime);
			} else {
				workedTime = TCH_DifferenceOfTime(time, startTime.text());
			}
			input.val(workedTime);
			localStorage[input.attr('id')] = workedTime;
			

			$(this).hide();
			var startId = '#' + $(this).attr('id').replace('Stop', 'Start');
			$(startId).show();
			mainRow.removeClass('inProgress');

			localStorage.removeItem(prefix + dayId + '_' + 'startTime' + taskIndex + '-' + subtaskIndex);
			startTime.text('');

			var labelTime = GetTimeForOtherLabel(dayId);
			$('#' + prefix + dayId + '_other_labelTime_usual').text(ToTime(labelTime));
			$('#' + prefix + dayId + '_other_labelTime_decimal').text(labelTime);

			rowsIndex[prefix + dayId] = CheckRowsNumber(rowsIndex[prefix + dayId], dayId);
			rowsIndex[prefix + dayId] = RecountIds(dayId);
			if (rowsIndex[prefix + dayId]) {
				localStorage[prefix + dayId] = rowsIndex[prefix + dayId];
			} else {
				localStorage.removeItem(prefix + dayId);
			}			

			SetTableHeightForTime();
		}
	);

	$(document).on('click', 'tr[id]:not(.future):not(.trTimeChecker):not(.other):not(.header)',
		function (){
			var currentRow = $(this);
			var dayId = currentRow.attr('id');

			if (currentRow.next().is(':visible')) {
				$('[dayid=' + dayId + ']').hide();
				currentRow.removeClass('timesheetOpened');

			} else {
				$('[dayid=' + dayId + ']').show();
				currentRow.addClass('timesheetOpened');
			}

			SetTableHeightForTime();
		}
	);

	$(document).on('click', '#currentDayToggle',
		function (){
			$('button.resetButton').click();
			$(this).addClass('mdl-button--raised mdl-button--accent');
			$('#allDaysToggle').removeClass('mdl-button--raised mdl-button--accent');
			
			var dayId = GetCurrentDayId();
			$('tr.intervalRow, tr[id], tr.dayoff').hide();
			$('#' + dayId + ', [dayid=' + dayId + ']').show();
			$('tr[id]:not(.future):not(.trTimeChecker):not(.other):not(.header)').removeClass('timesheetOpened');
			$('#' + dayId).first().addClass('timesheetOpened');
	
			SetTableHeightForTime();
		}
	);
	
	$(document).on('click', '#allDaysToggle',
		function (){
			$('button.resetButton').click();
			$(this).addClass('mdl-button--raised mdl-button--accent');
			$('#currentDayToggle').removeClass('mdl-button--raised mdl-button--accent');
			
			var dayId = GetCurrentDayId();
			$('tr.intervalRow, tr.dayoff, tr[id]').not('.future').not('.trTimeChecker').not('.other').not('.header').show();
			$('.trTimeChecker').hide();
			$('.other').hide();
			$('.header').hide();
			$('#' + dayId).first().removeClass('timesheetOpened');
			
			SetTableHeightForTime();
		}
	);

	$(document).on('click', '.intervalRow, button.resetButton',
		function (){
			$('.trTimeChecker').hide();
			$('.other').hide();
			$('.header').hide();

			$('.timesheetOpened').removeClass('timesheetOpened');

			SetTableHeightForTime();
		}
	);
	
	document.querySelectorAll('[idtype="buttonCreateTemplate"]').forEach(function(item) {
		item.onclick = function(e) {
			$('table.full-size input[type=text]').prop('disabled', true);
			
			var currentRow = $(this).parent().parent();
			currentRow.find('[idtype="buttonUploadTemplate"]').hide();
			var dayId = currentRow.attr('dayid');			
			CreateTemplateMenu(dayId);

			$(this).hide();
			var saveId = '#' + $(this).attr('id').replace('Create', 'Save');
			$(saveId).show();
		};
	});
	
	document.querySelectorAll('[idtype="buttonSaveTemplate"]').forEach(function(item) {
		item.onclick = function(e) {
			$('table.full-size input[type=text]').prop('disabled', false);
			
			var currentRow = $(this).parent().parent();
			currentRow.find('[idtype="buttonUploadTemplate"]').show();
			var dayId = currentRow.attr('dayid');			
			SaveTemplate(dayId);
			DeleteMenu(dayId);

			$(this).hide();
			var createId = '#' + $(this).attr('id').replace('Save', 'Create');
			$(createId).show();
		};
	});
	
	document.querySelectorAll('[idtype="buttonUploadTemplate"]').forEach(function(item) {
		item.onclick = function(e) {
			var currentRow = $(this).parent().parent();
			var dayId = currentRow.attr('dayid');	
			rowsIndex[prefix + dayId] = UploadTemplate(dayId, rowsIndex[prefix + dayId]);
			rowsIndex[prefix + dayId] = CheckRowsNumber(rowsIndex[prefix + dayId], dayId);
			rowsIndex[prefix + dayId] = RecountIds(dayId);
			if (rowsIndex[prefix + dayId]) {
				localStorage[prefix + dayId] = rowsIndex[prefix + dayId];
			} else {
				localStorage.removeItem(prefix + dayId);
			}
		};
	});

	document.getElementById('timeChangeToDecimalButton').onclick = function(e) {
		shouldDecimalTimeBeShown = !shouldDecimalTimeBeShown;
		if (shouldDecimalTimeBeShown) {
			$('input[idtype=inputTime]').each(
				function() {
					
					if ($(this).parent().parent().hasClass('inProgress')) {
						return true;
					}
					
					var buttons = $(this).parent().find('button').hide();
					
					var time = $(this).val();
					if(time) {
						var regExp = /^([0-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/;
						if (regExp.test(time)) {
							time = RoundDecimalToQuarters(ToDecimal(time));
						} else {
							if(isInt(+time) || isFloat(+time)) {
								time = RoundDecimalToQuarters(time);
							}								
						}				
					
						$(this).val(time);
					}
				}
			);
			
			
			$('label[idtype=labelTime].usualTime').hide();			
			$('label[idtype=labelTime].decimalTime').show();
			
		} else {
			$('input[idtype=inputTime]').each(
				function() {
					if ($(this).parent().parent().hasClass('inProgress')) {
						return true;
					} else {
						$(this).parent().find('button[idtype="buttonTimeStart"]').show();
					}
					
					
					var id = $(this).attr('id');
					$(this).val(localStorage[id]);
				}
			);
			
			$('label[idtype=labelTime].usualTime').show();			
			$('label[idtype=labelTime].decimalTime').hide();
		}
	};
});