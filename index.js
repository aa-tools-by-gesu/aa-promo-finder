
const request = require('request');
const fs = require('fs');

let obj, alph1, alph2, alph3, alph4, id = 0, random_item, uri;
var out = [];
var path = './cache/result.json';

function indexOfArray2D(array, target) {
	for (var i = 0; i < array.length; i++) {
		if (array[i][1] == target) {
			return i;
		}
	}
	return false;
}

function generateArray() {
	for(i1 = 9; ++i1 < 16;) {
		alph1 = i1.toString(36).toLowerCase(); // a-z
		for(i2 = 9; ++i2 < 16;) {
			alph2 = i2.toString(36).toLowerCase(); // a-z
			for(i3 = -1; ++i3 < 10;) {
				alph3 = i3.toString(36); // 0-9
				for(i4 = -1; ++i4 < 10;) {
					alph4 = i4.toString(36); // 0-9
					id++; // '0001' - '3600'
					out.push([String(id).padStart(4, '0'), alph1 + alph2 + alph3 + alph4, "?"]); // aa00 - ff99
				}
			}
		}
	}
	out.unshift(new Date().toISOString());
}

function writeCache(path, data) {
	if (!fs.existsSync(path)) {
		console.log('File not found!'); // Writing generated one...
	}
	// https://stackoverflow.com/a/31777314/8175291
	fs.writeFileSync(path, JSON.stringify(data, null, 4), { flag: 'w' }, function(error) { // 'wx' for "EEXIST"
		if (error) {
			console.log('Error occured while data saving: ', err);
		} else {
			console.log('Data saved.');
		}
	});
}

console.clear();
generateArray();
if (!fs.existsSync(path)) {
	writeCache(path, {out}, true);
}
obj = JSON.parse(fs.readFileSync(path, 'utf8'))["out"];


/* random_item = out[Math.floor(Math.random() * out.length)][0]; */
/* var uri = "http://aa.mail.ru/promo/" + random_item + "/"; */
/* uri_ok = "aa81"; //"https://www.google.ru/";
uri_fail = "aa00";
if (0) random_item=uri_ok; if (1) random_item=uri_fail;
uri = "https://archeage.ru/promo/" + random_item + "/index.html";

console.log([out[0]], ",");
console.log(out.slice(1, 4), "...");
console.log(out.slice(-3, out.length));
console.log("Random target URL:", uri); */


var req_options = {
	uri: '',
	port: 80,
	method: 'GET',
	headers: {
		'Accept': 'text/html',
		'Accept-Charset': 'utf-8',
		'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' // AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.0.4758.82 Safari/537.36
	}
};

for (var i = 1; i < out.length; i++) { // first is date
	uri = "https://archeage.ru/promo/" + out[i][1] + "/index.html";
	req_options.uri = uri;
	console.log('Data receiving in progress...', req_options.uri);
	if (1) request(req_options, function(error, response, body) {
		if (!error) {
			if (response.statusCode == 200) {
				console.log('200 OK — website and connection is up');
				out[indexOfArray2D(out, random_item)][2] = '+';
			}
			if (response.statusCode in Array.from(Array(300, 399).keys())) {
				console.log('Redirect (status code):', response.statusCode);
				out[indexOfArray2D(out, random_item)][2] = '-';
				writeCache(path, {out}, true);
			} else if (response.request.uri.href == "https://archeage.ru/" || response.request.uri.href != uri ) { // https://stackoverflow.com/a/17362976/8175291
				console.log('Redirect (request href) — there is no promo');
				out[indexOfArray2D(out, random_item)][2] = '-';
				writeCache(path, {out}, true);
			} else if (response.statusCode != 200) {
				console.log('Error:', response.statusCode);
			}
		} else {
			console.error('Error occured while data receiving:', error);
			console.log('Non-OK HTTP status code received:', response && response.statusCode);
		}
	});
}

