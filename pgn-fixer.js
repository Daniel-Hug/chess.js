// assuming "Chess" global
var chess = new Chess();
var state = new Snoopy({
	valid: false, // is the PGN in the input textarea valid?
	inputPGN: '',
	fixedPGN: '', // the "corrected" PGN chess.js came up with based off the input
	possibleNextMoves: chess.moves() // ['e4', 'd4', 'Nf3', ...]
});

// whenever input PGN changes...
state.snoop('inputPGN', function(inputPGN) {
	// load PGN into Chess instance and update 'valid' in state
	state.set('valid', !!chess.load_pgn(inputPGN));

	// update possible next moves in state
	state.set('possibleNextMoves', chess.moves());

	// update fixed PGN in state
	state.set('fixedPGN', chess.pgn({
		newline_char: '\n'
	}));
});

// while (!chess.game_over()) {
//   var moves = chess.moves();
//   var move = moves[Math.floor(Math.random() * moves.length)];
//   chess.move(move);
// }
// console.log(chess.pgn());