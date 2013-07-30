var projectIds = null;
var representatives = null;
var currentProject = null;
var results = null;

var projects = [
	"expediente-2222-j-11"
];

function shuffle(array) {
	var counter = array.length, temp, index;

	while (counter > 0) {
		index = (Math.random() * counter--) | 0;
		temp = array[counter];
		array[counter] = array[index];
		array[index] = temp;
	}

	return array;
}

function reset() {
	currentProject = null;
	results = {};
	projectIds = shuffle(projects.slice(0));
	$('#intro').css('display', 'block');
	$('#about').css('display', 'none');
	$('#voting').css('display', 'none');
	$('#results').css('display', 'none');
}

function loadRandomProject() {
	currentProject = null;
	if (projectIds.length == 0) {
		finish();
		return;
	}
	var id = projectIds.pop();
	$.getJSON(id + '.json', function (data) {
		currentProject = data;
		$('#project').text(data.nombre);
		$('#summary').text(data.sumario);
		$('#date').text(data.fecha + ' - ' + data.asunto);
		$('#voting').fadeIn(100);
		var n = projects.length;
		var i = n - projectIds.length - 1;
		var p = Math.round(i * 100 / n);
		$('#progress-bar span').css('width', p + '%');
		$('#progress-status').text('Completado: ' + i + ' / ' + n);
	});
}

function vote(choice) {
	var voting = currentProject.votacion;
	if (!voting) return;
	voteHelper(voting.AFIRMATIVO, (choice == 'Y'));
	voteHelper(voting.NEGATIVO, (choice == 'N'));
	voteHelper(voting.ABSTENCION, (choice == 'A'));
	voteHelper(voting.AUSENTE, (choice == '0'));
}

function voteHelper(keys, coinciding) {
	if (!keys) return;
	for (var i = 0; i < keys.length; i++) {
		var k = keys[i];
		if (!(results[k])) {
			results[k] = $.extend({
				coincidences: 0,
				discrepancies: 0,
			}, representatives[k]);
		}
		if (coinciding) {
			results[k].coincidences += 1;
		} else {
			results[k].discrepancies += 1;
		}
	}
}

function printResults(callback) {
	var rows = $('#rows');
	rows.empty();
	var tuples = sortResults(callback);
	for (var i = 0; i < tuples.length; i++) {
		var r = tuples[i];
		var tr = document.createElement('tr');
		$(tr).attr('id', i);

		var td = document.createElement('td');
		var span = document.createElement('span'); 
		$(span).text(r.nombre);
		$(td).append(span);
		$(td).append(document.createElement('br'));
		var info = document.createElement('span'); 
		$(info).text(r.bloque);
		//$(info).text(r.bloque + ' (' + r.distrito + ')');
		$(info).addClass('shady');
		$(td).append(info);
		tr.appendChild(td);

		printResultsHelper(tr, r.chance + '%');
		printResultsHelper(tr, r.participation + '%');
		printResultsHelper(tr, r.coincidences);
		printResultsHelper(tr, r.discrepancies);
		printResultsHelper(tr, r.difference);
		rows.append(tr);
	}
}

function printResultsHelper(tr, text) {
	var td = document.createElement('td');
	$(td).text(text);
	$(td).addClass('center');
	tr.appendChild(td);
}

function sortResults(callback) {
	var tuples = new Array();
	for (i in results) {
		var r = results[i];
		var total = r.coincidences + r.discrepancies;
		r.id = i;
		r.difference = r.coincidences - r.discrepancies;
		r.chance = Math.round(r.coincidences * 100 / total);
		r.participation = Math.round(total * 100 / projects.length)
		tuples.push(r);
	}
	tuples.sort(callback);
	return tuples;
}

function sortByName(a, b) {
	return a.nombre.localeCompare(b.nombre);
}

function sortByChance(a, b) {
	var d = b.chance - a.chance; if (d) return d;
	var d = b.participation - a.participation; if (d) return d;
	var d = b.difference - a.difference; if (d) return d;
	var d = b.coincidences - a.coincidences; if (d) return d;
	var d = a.discrepancies - b.discrepancies; if (d) return d;
	return a.nombre.localeCompare(b.nombre);
}

function sortByDifference(a, b) {
	var d = b.difference - a.difference; if (d) return d;
	var d = b.chance - a.chance; if (d) return d;
	var d = b.participation - a.participation; if (d) return d;
	var d = b.coincidences - a.coincidences; if (d) return d;
	var d = a.discrepancies - b.discrepancies; if (d) return d;
	return a.nombre.localeCompare(b.nombre);
}

function sortByCoincidences(a, b) {
	var d = b.coincidences - a.coincidences; if (d) return d;
	var d = b.chance - a.chance; if (d) return d;
	var d = b.participation - a.participation; if (d) return d;
	var d = b.difference - a.difference; if (d) return d;
	var d = a.discrepancies - b.discrepancies; if (d) return d;
	return a.nombre.localeCompare(b.nombre);
}

function sortByDiscrepancies(a, b) {
	var d = a.discrepancies - b.discrepancies; if (d) return d;
	var d = b.chance - a.chance; if (d) return d;
	var d = b.participation - a.participation; if (d) return d;
	var d = b.difference - a.difference; if (d) return d;
	var d = b.coincidences - a.coincidences; if (d) return d;
	return a.nombre.localeCompare(b.nombre);
}

function sortByParticipation(a, b) {
	var d = b.participation - a.participation; if (d) return d;
	var d = b.chance - a.chance; if (d) return d;
	var d = b.difference - a.difference; if (d) return d;
	var d = b.coincidences - a.coincidences; if (d) return d;
	var d = a.discrepancies - b.discrepancies; if (d) return d;
	return a.nombre.localeCompare(b.nombre);
}

function finish() {
	printResults(sortByDifference);
	$('#voting').stop(true);
	$('#voting').fadeOut(200, function () {
		$('#results').fadeIn(100);
	});
}

function shareOnFacebook() {
	window.open('https://www.facebook.com/sharer/sharer.php?u='
		+ encodeURIComponent(location.href),
		'facebook-share-dialog', 'width=626,height=436');
}

function shareOnTwitter() {
	var tweet = '\u00bfNo sab\u00e9s a qui\u00e9n votar? '
		+ 'Prob\u00e1 este juego para elegir legisladores '
		+ 'que votan como vos: ';
	window.open('http://twitter.com/intent/tweet?text='
		+ encodeURIComponent(tweet) + '&url='
		+ encodeURIComponent(location.href)
		+ '&hashtags=opengov,elegilegi',
		'twitter-share-dialog', 'width=550,height=420');
}

function shareOnGooglePlus() {
	window.open('https://plus.google.com/share?url='
		+ encodeURIComponent(location.href),
		'google-share-dialog', 'width=600,height=600');
}

$(document).ready(function () {
	$(document).ajaxError(function (evnt, jqxhr, options, e) {
		alert('Error al cargar datos de: ' + options.url
			+ '\n\n' + JSON.stringify(jqxhr, null, 2)
			+ '\n\nPor favor, recarg\u00e1 la p\u00e1gina.');
	});

	$.getJSON('legisladores.json', function (data) {
		representatives = data;
		$('#start').click(function () {
			$('#intro').fadeOut(200, loadRandomProject);
		});
	});

	$('#vote-aye').click(function () {
		if (!currentProject) return;
		vote('Y');
		$('#voting').fadeOut(200, loadRandomProject);
	});
	$('#vote-nay').click(function () {
		if (!currentProject) return;
		vote('N');
		$('#voting').fadeOut(200, loadRandomProject);
	});
	$('#vote-abstention').click(function () {
		if (!currentProject) return;
		vote('A');
		$('#voting').fadeOut(200, loadRandomProject);
	});
	$('#vote-absentee').click(function () {
		if (!currentProject) return;
		vote('0');
		$('#voting').fadeOut(200, loadRandomProject);
	});
	$('#vote-skip').click(function () {
		if (!currentProject) return;
		$('#voting').fadeOut(200, loadRandomProject);
	});

	$('.facebook').click(shareOnFacebook);
	$('.twitter').click(shareOnTwitter);
	$('.googleplus').click(shareOnGooglePlus);

	$('#name').click(function () {
		printResults(sortByName);
	});
	$('#chance').click(function () {
		printResults(sortByChance);
	});
	$('#participation').click(function () {
		printResults(sortByParticipation);
	});
	$('#coincidences').click(function () {
		printResults(sortByCoincidences);
	});
	$('#discrepancies').click(function () {
		printResults(sortByDiscrepancies);
	});
	$('#difference').click(function () {
		printResults(sortByDifference);
	});

	$('#link').click(function () {
		if (currentProject) window.open(currentProject.url, '_blank');
	});
	$('#info').click(function () { $('#about').slideToggle(500); });
	$('#back').click(function () { $('#about').slideToggle(500); });
	$('#reset').click(reset);
	reset();
});
