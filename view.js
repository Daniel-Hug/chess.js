var pgnInput = qs('#pgn-input');
var pgnOutput = qs('#pgn-output');

on(pgnInput, 'input', function() {
	var PGNString = pgnInput.value;
	state.set('inputPGN', PGNString);
});


// validity state
dom({
	el: qs('.hidden-when-valid'),
	_hidden: state.snoop('valid')
})

dom({
	el: document.body,
	class_validPGN: state.snoop('valid'),
});

dom({
	el: pgnInput,
	_value: state.snoop('inputPGN'),
});

dom({
	el: pgnOutput,
	_value: state.snoop('fixedPGN'),
});


// speech recognition

var SpeechRecognition = SpeechRecognition || webkitSpeechRecognition;
var SpeechGrammarList = SpeechGrammarList || webkitSpeechGrammarList;
var SpeechRecognitionEvent = SpeechRecognitionEvent || webkitSpeechRecognitionEvent;

// setup recognition instance
var recognition = new SpeechRecognition();
recognition.lang = 'en-US';
recognition.interimResults = false;
recognition.maxAlternatives = 20;

function createSpeechGrammerList(phrases) {
	var grammar = '#JSGF V1.0; grammar phrases; public <phrase> = ' + 
	phrases.join(' | ') + ' ;';
	var speechRecognitionList = new SpeechGrammarList();
	speechRecognitionList.addFromString(grammar, 1);
	return speechRecognitionList;
}

function expandPieceName(move) {
	return move.split('N').join('knight ')
	.split('B').join('bishop ')
	.split('R').join('rook ')
	.split('Q').join('queen ')
	.split('K').join('king ');
}

function expandMoveResult(move) {
	return move.split('+').join(' check')
	.split('#').join(' checkmate');
}

function expandTakes(move) {
	var parts = move.split('x').join(' takes ').split(' ');
	var last = parts.pop().toUpperCase();
	return parts.join(' ') + last;
}

function getSpokenAlternatives(move) {
	var alternatives = [];
	if (move.length === 2) {
		alternatives.push(move.toUpperCase());
	} else {
		move = expandPieceName(expandTakes(move));
		alternatives.push(move);
		alternatives.push(expandMoveResult(move));
	}

	return alternatives;
}

state.snoop('possibleNextMoves', function(possibleNextMoves) {
	// update speech recognition grammar list
	var waysToSayThePossibleNextMoves = [].concat.apply([], possibleNextMoves.map(getSpokenAlternatives));
	console.log(waysToSayThePossibleNextMoves);
	recognition.grammars = createSpeechGrammerList(waysToSayThePossibleNextMoves);
});

// var grammar = '#JSGF V1.0; grammar phrases; public <phrase> = aqua | azure | beige | bisque | black | blue | brown | chocolate | coral | crimson | cyan | fuchsia | ghostwhite | gold | goldenrod | gray | green | indigo | ivory | khaki | lavender | lime | linen | magenta | maroon | moccasin | navy | olive | orange | orchid | peru | pink | plum | purple | red | salmon | sienna | silver | snow | tan | teal | thistle | tomato | turquoise | violet | white | yellow ;';
// var recognition = new SpeechRecognition();
// var speechRecognitionList = new SpeechGrammarList();
// speechRecognitionList.addFromString(grammar, 1);
// recognition.grammars = speechRecognitionList;
//recognition.continuous = false;

var diagnostic = document.querySelector('.output');

document.body.onclick = function() {
	recognition.start();
	console.log('Ready to receive a color command.');
};

function fixMove(move) {
	if (move.length === 2) {
		return move.toLowerCase();
	} else {
		move = move.split(' takes ').join('x');
		move = move.split(' check').join('+');
		move = move.split(' checkmate').join('#');
		move = move.split('knight ').join('N');
		move = move.split('bishop ').join('B');
		move = move.split('rook ').join('R');
		move = move.split('queen ').join('Q');
		move = move.split('king ').join('K');
	}
	return move;
}

recognition.onresult = function(event) {
	// The SpeechRecognitionEvent results property returns a SpeechRecognitionResultList object
	// The SpeechRecognitionResultList object contains SpeechRecognitionResult objects.
	// It has a getter so it can be accessed like an array
	// The first [0] returns the SpeechRecognitionResult at position 0.
	// Each SpeechRecognitionResult object contains SpeechRecognitionAlternative objects that contain individual results.
	// These also have getters so they can be accessed like arrays.
	// The second [0] returns the SpeechRecognitionAlternative at position 0.
	// We then return the transcript property of the SpeechRecognitionAlternative object 
	var move = fixMove(event.results[0][0].transcript);
	diagnostic.textContent = 'Result received: ' + move + '.';

	// make move and update PGN in state
	chess.move(move);
	state.set('inputPGN', chess.pgn({
		newline_char: '\n'
	}));

	console.log([].map.call(event.results[0], function(alternative) {
		return alternative.transcript;
	}).join('\n'));
};

recognition.onspeechend = function() {
	recognition.stop();
};

recognition.onnomatch = function(event) {
	diagnostic.textContent = 'I didnt recognise that color.';
};

recognition.onerror = function(event) {
	diagnostic.textContent = 'Error occurred in recognition: ' + event.error;
};

