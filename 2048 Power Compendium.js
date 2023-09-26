//Opening setup (the code that executes on its own)
let width = 4; let height = 4; let min_dim = 2; //width and height are the dimensions of the grid, min_dim doesn't really do anything other than set defaults for certain modifiers
let TileNumAmount = 1;
let TileTypes = [[[0], 1, "#ffffff", "#776e65"], [[1], 2, "#f9eee3", "#776e65"], [[2], 4, "#ede0c8", "#776e65"], [[3], 8, "#f2b179", "#f9f6f2"],
[[4], 16, "#f59563", "#f9f6f2"], [[5], 32, "#f67c5f", "#f9f6f2"], [[6], 64, "#f65e3b", "#f9f6f2"], [[7], 128, "#edcf72", "#f9f6f2"],
[[8], 256, "#edcc61", "#f9f6f2"], [[9], 512, "#edc850", "#f9f6f2"], [[10], 1024, "#edc53f", "#f9f6f2"], [[11], 2048, "#edc22e", "#f9f6f2"],
[[12], 4096, "#f29eff", "#f9f6f2"], [[13], 8192, "#eb75fd", "#f9f6f2"], [[14], 16384, "#e53bff", "#f9f6f2"], [[15], 32768, "#bd00db", "#f9f6f2"],
[[16], 65536, "#770089", "#f9f6f2"], [[17], 131072, "#534de8", "#f9f6f2"], [[18], 262144, "#2922e1", "#f9f6f2"], [[19], 524288, "#0a05b6", "#f9f6f2"],
[true, [2, "^", "@This 0"], ["@HSLA", [-15, "*", "@This 0", "+", 520], 100, [0.9, "^", ["@This 0", "-", 20], "*", 36], 1], "#f9f6f2"]];
    /*
    Tiles are stored as arrays of numbers. For example, in 2048, tiles are arrays containing a single number, which is log2 of the tile's number, so a 4 is [2] and
    a 32 is [5]. In many of the main modes, the tiles are stored as two numbers, and the tile number of [a, b] is x^a * b, where x is the power number of the mode,
    so [4, 2] in 2187 is a 3^4 * 2 = 162 tile, while [1, 3] in 4096 is a 8^1 * 3 = 24 tile. TileNumAmount is the amount of entries in such an array for the current
    gamemode. TileTypes is an array where each entry corresponds one type of tile; within each entry, the 0th entry is either the array of that tile or a CalcArray
    expression that, if it evaluates to true, indicates that the tile should use that entry of TileTypes, the 1st entry is the text on the tile, the 2nd entry
    is the color of the tile, and the third entry is the color of the text.
    */
let MergeRules = [[2, ["@Next 1 0", "=", "@This 0"], true, [[["@This 0", "+", 1]]], [2, "^", ["@This 0", "+", 1]], [false, true]]];
    /* MergeRules, like TileTypes, is an array where each entry corresponds to one merge rule. The 0th entry is the amount of tiles in that merge, the 1st entry
    is a CalcArray expression that must evaluate to true for those tiles to merge, the 2nd entry is whether those tiles need to be in order or not, the third entry
    is an array containing the tile(s) that result from the merge, the fourth entry is how much the score increases from this merge, and the fifth entry is
    whether each resulting tile counts as having "used up" its merge that turn. Some modes have merge rules with more than six entries; these rules can scale
    to multiple lengths. For these multi-length rules, the 0th entry now means the minimum merge length, the 6th entry is what the length of the merge rule as given
    is, the 7th entry is what to increase each "@Next"'s first number by on each merge length increase (so if the 7th entry is [1, 2, 0], then any strings that were
    originally "@This 0" become "@Next 1 0", then "@Next 2 0", and so on, any strings that were originally "@Next 1 0" become "@Next 3 0", then "@Next 5 0", and
    so on, and any strings that were originally "@Next 2 0" are unchanged, as are any that were originally "@Next 3" or higher since the 7th entry doesn't go
    that far), the 8th entry is how much to increase the merge length by on each merge length increase, and the 9th entry is the maximum merge length. */
let startTileSpawns = [[[0], 85], [[1], 12], [[2], 3]]; //TileSpawns is reset to its starting value when a new round starts
let TileSpawns = [[[0], 85], [[1], 12], [[2], 3]];
    /* TileSpawns contains the tiles that can spawn between each move. The 0th entry of each entry of TileSpawns is the tile being spawned, the 1st entry of each
    entry of TileSpawns is the likelihood that that tile type is the one that spawns. */
let spawnConditions = true; //Tiles only spawn on a turn where spawnConditions is true
let winConditions = [[11]]; //Which tiles count as "winning"?
let winRequirement = 1; //How many "winning" tiles you need to win
let loseConditions = []; //Which tiles count as "losing"?
let loseRequirement = false; //How many "losing tiles" you need to immediately lose; if this is false, instant loss is not in play
let winPriority = true; //If this is true, if you win and lose from conditions on the same turn, you win. If this is false, you lose in that situation.
let multiMerge = false; //Can tiles merge multiple times in one turn?
let spawnLocation = "All"; //Where do new tiles spawn?
let startTileAmount = 2; //How many tiles spawn at the beginning of the game
let randomTileAmount = 1; //How many tiles spawn after each move
let modifiers = [Infinity, 1, 2, false, "All", "Square", 0, 0, 0, 0, "Orthogonal", false, false, "None", 0, "Regular", 1, 0, 0, 1, false];
    /*
    modifiers[0] corresponds to SlideAmount, modifiers[1] corresponds to randomTileAmount, modifiers[2] corresponds to startTileAmount, modifiers[3] corresponds
    to multiMerge, and modifiers[4] corresponds to spawnLocation. modifiers[5] changes the shape of the grid, and modifiers[6] through modifiers[9] are used as size
    variables for alternate grid shapes. modifiers[10] controls the available directions, modifiers[11] is whether you can stay still as a move, modifiers[12] is the
    toggle for Garbage 0s, modifiers[13] is the toggle for Negative Tiles, modifiers[14] corresponds to nextTiles, modifiers[15] is the toggle for SimpleSpawns,
    modifiers[16] is the animation speed, modifiers[17] adds holes to the grid, modifiers[18] adds box tiles to the grid, modifiers[19] changes how many turns
    there are between each tile spawning (which is done by changing spawnConditions), and modifiers[20] is whether it takes two moves in the same direction to merge.
    */
let gamemode = 0; //Which mode are we in? 2048 is gamemode 1, 2187 is gamemode 2, 1024 is gamemode 3, and so on. Save codes use gamemode 0 to alert StartGame to not go through some of the starting steps.
let mode_vars = []; //Used by a couple gamemodes
let nextTiles = 0; //How many next-to-spawn tiles are visible to the player?
document.documentElement.style.setProperty("--background-color", "#fff5da");
document.documentElement.style.setProperty("--grid-color", "#c7bea7");
document.documentElement.style.setProperty("--tile-color", "#ece0c2");
document.documentElement.style.setProperty("--text-color", "#524c46");
displayRules("rules_text", ["h2", "Powers of 2"], ["h1", "2048"], ["p", "Merges occur between two tiles of the same number. Get to the 2048 tile to win!"],
["p", "Spawning tiles: 1 (85%), 2 (12%), 4 (3%)"]);
let directions = [ 
    /*
    An array where each entry is one movement direction. The 0th entry of each entry contains the movement magnitudes: directions[x][0][0] is the vertical
    magnitude, directions[x][0][1] is the horizontal magnitude. The 1st entry of each entry is the text on the arrow button, the 2nd entry of each entry is the
    size of the button, the 3rd entry of each entry is the font size, the 4th entry of each entry is the vertical position, the 5th entry of each entry is the
    horizontal position, the 6th entry of each entry is the keyboard keys associated with that direction, and the 7th entry of each entry is the rotation of the
    text on the button. Positive vertical is downwards, positive horizontal is rightwards. The top-left tile of the grid is at position [0, 0].
    */
    [[-1, 0, Infinity, 0, [1, true, true, true]], "&#8593;", 5/33, 5/33, 3/33, 6/33, 14/33, ["ArrowUp", "KeyW"]],
    [[1, 0, Infinity, 0, [1, true, true, true]], "&#8595;", 5/33, 5/33, 3/33, 22/33, 14/33, ["ArrowDown", "KeyS"]],
    [[0, -1, Infinity, 0, [1, true, true, true]], "&#8592;", 5/33, 5/33, 3/33, 14/33, 6/33, ["ArrowLeft", "KeyA"]],
    [[0, 1, Infinity, 0, [1, true, true, true]], "&#8594;", 5/33, 5/33, 3/33, 14/33, 22/33, ["ArrowRight", "KeyD"]],
];
let directionsAvailable = [true, true, true, true]; //Which directions can currently be moved in? The game ends once all entries are false.
let score = 0;
let won = 0; //This is a positive number if you've discovered any winning tiles but haven't won yet, and it's -1 if you've won the game
let moves_so_far = 0;
let manual_moves_so_far = 0;
let merges_so_far = 0;
let moves_where_merged = 0; //How many moves did a merge occur on
let merges_before_now = 0; //merges_so_far, but it only updates at the end of each move
let discoveredTiles = [];
let discoveredWinning = [];
let discoveredLosing = [];
let SpawnBoxes = []; //In modes like 3072 that have spawn boxes, this is where those are stored
let spawnConveyor = ["@Empty"]; //The next spawning tiles are stored here
let game_vars = []; //Variables that can be accessed by TileTypes and MergeRules
let modifier_vars = []; //These are like game_vars, but assigned automatically by modifiers rather than by gamemodes
let start_game_vars = []; //game_vars is set to this at the beginning of each game
let start_modifier_vars = []; //modifier_vars is set to this at the beginning of each game
let scripts = [];
/*
A list of CalcArray expressions that can be executed at different times. Each entry of this array is an array of two elements: the first is the CalcArray
expression, the second is the type of the script, which determines when it should be executed. Note that nothing is done with the return values of the CalcArray
expressions, so scripts are mainly there for the purpose of editing the gamemode variables.
*/
let possibleOverChecked = false; //Checks whether the "about to be game over" scripts have been run yet
let movementParameters = ["@VDir", "@HDir", "@SlideAmount"]; //What are the ACTUAL movement stats for each tile? CalcArray expressions can be used here to make different tiles move in different ways.
let postgameAllowed = true; //If this is false, you can't continue after winning
let auto_directions = []; // Like directions, but used for automatic moves
let forcedSpawns = [];
/*
Each entry of this array consists of a CalcArray expression, a string, a boolean, and one or more tile arrays.
If the CalcArray expression is true this turn, then all of the tiles in this entry will be spawned this turn, either before or after the random spawns
depending on the string. If there aren't enough spaces on the grid to spawn them all and the boolean is true, then you immediately lose.
*/

let Grid = [];
let startingGrid = [];
let tsize = 0; //This is used by CreateGrid and DisplayGrid
let GridTiles; let visibleNextTiles; let customGridTiles; //These will be HTMLCollections
let statBoxes = [["Score", "@Score"]]; // Which stats are visible on the screen; the first entry of each entry is the text in that box, the second is a CalcArray that returns the box's value

    //These lists of operators are used by CalcArrayConvert
let special_operators = ["@repeat", "@if", "@else", "@else-if", "@edit_var", "@add_var", "@insert_var", "@remove_var", "@end-repeat", "@end-if", "@end-else", "@end-else-if", "@end_vars", "@var_retain", "@var_copy", "@include_gvars", "@edit_gvar", "@add_gvar", "@insert_gvar", "@remove_gvar", "@add_score", "@edit_spawn", "@add_spawn", "@insert_spawn", "@remove_spawn", "@replace_tile", "@run-script"];
let any_operators = ["=", "!=", ">", "<", ">=", "<=", "max", "min", "1st", "first", "2nd", "second", "Number", "String", "Boolean", "Array", "BigInt", "typeof", "output", "CalcArrayParent"];
let number_operators = ["+", "-", "*", "/", "%", "mod", "^", "**", "log", "round", "floor", "ceil", "ceiling", "trunc", "abs", "sign", "sin", "cos", "tan", "gcd", "lcm", "factorial", "prime", "expomod", "rand_int", "rand_float", "defaultAbbrev"];
let string_operators = ["str_char", "str_concat", "str_concat_front", "str_length", "str_slice", "str_substr", "str_replace", "str_indexOf", "str_lastIndexOf", "str_indexOfFrom", "str_lastIndexOfFrom", "str_includes", "str_splice", "str_toUpperCase", "str_toLowerCase", "str_split"];
let boolean_operators = ["&&", "||", "!"];
let array_operators = ["arr_elem", "arr_edit_elem", "arr_length", "arr_push", "arr_pop", "arr_shift", "arr_unshift", "arr_concat", "arr_concat_front", "arr_flat", "arr_splice", "arr_slice", "arr_indexOf", "arr_lastIndexOf", "arr_indexOfFrom", "arr_lastIndexOfFrom", "arr_includes", "arr_reverse", "arr_sort", "arr_map", "arr_reduce", "arr_reduceRight", "CalcArray"];
let bigint_operators = ["+B", "-B", "*B", "/B", "%B", "modB", "^B", "**B", "rootB", "logB", "floorB", "ceilB", "ceilingB", "absB", "signB", "gcdB", "lcmB", "factorialB", "primeB", "expomodB", "rand_bigint", "defaultAbbrevB"];
let pop_1_operators = ["abs", "absB", "sign", "signB", "sin", "cos", "tan", "!", "factorial", "factorialB", "prime", "primeB", "defaultAbbrev", "defaultAbbrevB", "str_length", "str_toUpperCase", "str_toLowerCase", "arr_length", "arr_pop", "arr_shift", "arr_reverse", "Number", "String", "Boolean", "Array", "typeof"]; //CalcArray, the operator, also only takes 1 input, but it's a special case so it's not in this list

    //Bunch of event listeners
document.getElementById("menu_extra").addEventListener("click", function(){
    switchScreen("Menu", "Extra");
});
document.getElementById("menu_extra_return").addEventListener("click", function(){
    switchScreen("Menu", "Main");
});
document.getElementById("menu_import").addEventListener("click", function(){
    switchScreen("SaveCode", "Import");
});
document.getElementById("menu_to_modifiers").addEventListener("click", function(){
    switchScreen("Modifiers", 1);
});
document.getElementById("menu_to_guide").addEventListener("click", function(){
    switchScreen("Guide", "Guide");
});
document.getElementById("gm_width_minus").addEventListener("click", function(){
    width--;
    gmDisplayVars();
});
document.getElementById("gm_width_plus").addEventListener("click", function(){
    width++;
    gmDisplayVars();
});
document.getElementById("gm_height_minus").addEventListener("click", function(){
    height--;
    gmDisplayVars();
});
document.getElementById("gm_height_plus").addEventListener("click", function(){
    height++;
    gmDisplayVars();
});
document.getElementById("gm_return").addEventListener("click", function(){
    if (gamemode > 25) switchScreen("Menu", "Extra");
    else switchScreen("Menu", "Main");
});
document.getElementById("return_button").addEventListener("click", function(){
    switchScreen("Menu", "Main");
});
document.getElementById("2048_spawn_button").addEventListener("click", function(){
    mode_vars[0] = !(mode_vars[0]);
    gmDisplayVars();
});
document.getElementById("3125_3-1_button").addEventListener("click", function(){
    mode_vars[0] = !(mode_vars[0]);
    gmDisplayVars();
});
document.getElementById("XXXX_min_plus").addEventListener("click", function(){
    mode_vars[0]++;
    if (mode_vars[1] < mode_vars[0]) mode_vars[1] = mode_vars[0];
    gmDisplayVars();
});
document.getElementById("XXXX_min_minus").addEventListener("click", function(){
    mode_vars[0]--;
    gmDisplayVars();
});
document.getElementById("XXXX_max_plus").addEventListener("click", function(){
    if (mode_vars[1] == Infinity) mode_vars[1] = Math.max(mode_vars[0], 3);
    else mode_vars[1]++;
    gmDisplayVars();
});
document.getElementById("XXXX_max_minus").addEventListener("click", function(){
    if (mode_vars[1] == Math.max(mode_vars[0], 3)) mode_vars[1] = Infinity;
    else mode_vars[1]--;
    gmDisplayVars();
});
document.getElementById("Isotopic256_halfLife_change").addEventListener("change", function() {
    let v = Number(this.value);
    if (isFinite(v) && v > 0) mode_vars[0] = v;
    else mode_vars[0] = 0.75;
    gmDisplayVars();
});
document.getElementById("ThreeHalves_mode_button").addEventListener("click", function(){
    mode_vars[0] = (mode_vars[0] + 1) % 2;
    gmDisplayVars();
});
document.getElementById("2592_switch_button").addEventListener("click", function(){
    mode_vars[0] = (mode_vars[0] + 1) % 3;
    gmDisplayVars();
});
document.getElementById("Wildcard2048_add_button").addEventListener("click", function(){
    mode_vars[0] = !(mode_vars[0]);
    gmDisplayVars();
});
document.getElementById("XpowY_pow_plus").addEventListener("click", function(){
    let primes = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, Infinity];
    let p = primes.indexOf(mode_vars[0]);
    mode_vars[0] = primes[mod((p + 1), 16)];
    gmDisplayVars();
});
document.getElementById("XpowY_pow_minus").addEventListener("click", function(){
    let primes = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, Infinity];
    let p = primes.indexOf(mode_vars[0]);
    mode_vars[0] = primes[mod((p - 1), 16)];
    gmDisplayVars();
});
document.getElementById("XpowY_merge_plus").addEventListener("click", function(){
    mode_vars[1]++;
    gmDisplayVars();
});
document.getElementById("XpowY_merge_minus").addEventListener("click", function(){
    mode_vars[1]--;
    gmDisplayVars();
});
document.getElementById("2100_difficulty_decrease").addEventListener("click", function(){
    mode_vars[0] -= 1;
    gmDisplayVars();
});
document.getElementById("2100_difficulty_increase").addEventListener("click", function(){
    mode_vars[0] += 1;
    gmDisplayVars();
});
document.getElementById("start_game").addEventListener("click", startGame);
document.addEventListener("keydown", (event) => {
    if (!inputAvailable || (currentScreen != "Gameplay" && !(currentScreen == "Modifiers" && subScreen == 3.2))) return;
    let directionUsed = -1;
    directionFinder : {
        for (let d = 0; d < directions.length; d++) {
            for (let k = 0; k < directions[d][7].length; k++) {
                if (directions[d][7][k] == event.code) {directionUsed = d; break directionFinder;}
            }
        }
    }
    if (currentScreen == "Gameplay" && directionUsed >= 0 && directionsAvailable[directionUsed]) MoveHandler(directionUsed);
    if (currentScreen == "Modifiers" && subScreen == 3.2) {
        if (directionUsed == -1) directions[screenVars[0]][7].push(event.code);
        inputAvailable = false;
        displayModifiers(3.2);
    }
});
document.getElementById("go_again").addEventListener("click", function(){
    if (!inputAvailable) return;
    PlayAgain();
});
document.getElementById("win_again").addEventListener("click", function(){
    if (!inputAvailable) return;
    PlayAgain();
});
document.getElementById("lone_win_again").addEventListener("click", function(){
    if (!inputAvailable) return;
    PlayAgain();
});
document.getElementById("win_continue").addEventListener("click", function(){
    if (!inputAvailable) return;
    document.getElementById("win_screen").style.setProperty("opacity", 0);
    document.getElementById("win_screen").style.setProperty("display", "none");
    won = -1;
    currentScreen = "Gameplay";
    displayButtons(true);
    inputAvailable = true;
});
document.getElementById("gp_export_button").addEventListener("click", function(){
    exportSave(true);
    switchScreen("SaveCode", "Export");
});
document.getElementById("save_code_import").addEventListener("click", function(){
    importSave(document.getElementById("save_code_box").value);
});
document.getElementById("save_code_return_game").addEventListener("click", function(){
    switchScreen("Gameplay", "Main");
});
document.getElementById("save_code_return_menu").addEventListener("click", function(){
    switchScreen("Menu", "Main");
});
document.getElementById("modifiers_return").addEventListener("click", function(){
    switchScreen("Menu", "Main");
});
document.getElementById("modifiers_previous_page").addEventListener("click", function(){
    if (modifiers[5] == "Custom") {
        if (subScreen == 1) switchScreen("Modifiers", 5);
        else if (subScreen == 5) switchScreen("Modifiers", 4);
        else if (subScreen == 4) switchScreen("Modifiers", 3.2);
        else if (subScreen == 3.2) switchScreen("Modifiers", 3.1);
        else if (subScreen == 3.1) switchScreen("Modifiers", 2);
        else switchScreen("Modifiers", 1);
    }
    else {
        if (subScreen == 1) switchScreen("Modifiers", 5);
        else switchScreen("Modifiers", subScreen - 1);
    }
});
document.getElementById("modifiers_next_page").addEventListener("click", function(){
    if (modifiers[5] == "Custom") {
        if (subScreen == 5) switchScreen("Modifiers", 1);
        else if (subScreen == 1) switchScreen("Modifiers", 2);
        else if (subScreen == 2) switchScreen("Modifiers", 3.1);
        else if (subScreen == 3.1) switchScreen("Modifiers", 3.2);
        else if (subScreen == 3.2) switchScreen("Modifiers", 4);
        else switchScreen("Modifiers", 5);
    }
    else {
        if (subScreen == 5) switchScreen("Modifiers", 1);
        else switchScreen("Modifiers", subScreen + 1);
    }
});
document.getElementById("modifiers_animationSpeed_change").addEventListener("change", function() {
    let v = Number(this.value);
    if (isFinite(v) && v >= 0) modifiers[16] = v;
    else mode_vars[0] = 1;
    displayModifiers(1);
});
document.getElementById("modifiers_slideAmount_minus").addEventListener("click", function(){
    if (modifiers[0] == 1) modifiers[0] = Infinity;
    else modifiers[0]--;
    displayModifiers(1);
});
document.getElementById("modifiers_slideAmount_plus").addEventListener("click", function(){
    if (modifiers[0] == Infinity) modifiers[0] = 1;
    else modifiers[0]++;
    displayModifiers(1);
});
document.getElementById("modifiers_randomTileAmount_plus").addEventListener("click", function(){
    modifiers[1]++;
    displayModifiers(1);
});
document.getElementById("modifiers_randomTileAmount_minus").addEventListener("click", function(){
    modifiers[1]--;
    displayModifiers(1);
});
document.getElementById("modifiers_startTileAmount_plus").addEventListener("click", function(){
    modifiers[2]++;
    displayModifiers(1);
});
document.getElementById("modifiers_startTileAmount_minus").addEventListener("click", function(){
    modifiers[2]--;
    displayModifiers(1);
});
document.getElementById("modifiers_nextTiles_plus").addEventListener("click", function(){
    modifiers[14]++;
    displayModifiers(1);
});
document.getElementById("modifiers_nextTiles_minus").addEventListener("click", function(){
    modifiers[14]--;
    displayModifiers(1);
});
document.getElementById("modifiers_randomVoid_plus").addEventListener("click", function(){
    modifiers[17]++;
    displayModifiers(1);
});
document.getElementById("modifiers_randomVoid_minus").addEventListener("click", function(){
    modifiers[17]--;
    displayModifiers(1);
});
document.getElementById("modifiers_randomBlackBox_plus").addEventListener("click", function(){
    modifiers[18]++;
    displayModifiers(1);
});
document.getElementById("modifiers_randomBlackBox_minus").addEventListener("click", function(){
    modifiers[18]--;
    displayModifiers(1);
});
document.getElementById("modifiers_spawnInterval_plus").addEventListener("click", function(){
    modifiers[19]++;
    displayModifiers(1);
});
document.getElementById("modifiers_spawnInterval_minus").addEventListener("click", function(){
    modifiers[19]--;
    displayModifiers(1);
});
document.getElementById("modifiers_multiMerge_button").addEventListener("click", function(){
    modifiers[3] = !(modifiers[3])
    displayModifiers(2);
});
document.getElementById("modifiers_spawnLocation_button").addEventListener("click", function(){
    if (modifiers[4] == "All") modifiers[4] = "Edge";
    else modifiers[4] = "All";
    displayModifiers(2);
});
document.getElementById("modifiers_gridShape_button").addEventListener("click", function(){
    if (modifiers[5] == "Square") modifiers[5] = "Diamond";
    else if (modifiers[5] == "Diamond") modifiers[5] = "Checkerboard";
    else if (modifiers[5] == "Checkerboard") modifiers[5] = "Hexagon";
    else if (modifiers[5] == "Hexagon") {modifiers[5] = "4D"; modifiers[10] = "Orthogonal"; modifiers[4] = "All";}
    else modifiers[5] = "Square";
    displayModifiers(3);
});
document.getElementById("gm_diamond_minus").addEventListener("click", function(){
    modifiers[6]--;
    gmDisplayVars();
});
document.getElementById("gm_diamond_plus").addEventListener("click", function(){
    modifiers[6]++;
    gmDisplayVars();
});
document.getElementById("gm_4D_width_minus").addEventListener("click", function(){
    modifiers[6]--;
    gmDisplayVars();
});
document.getElementById("gm_4D_width_plus").addEventListener("click", function(){
    modifiers[6]++;
    gmDisplayVars();
});
document.getElementById("gm_4D_height_minus").addEventListener("click", function(){
    modifiers[7]--;
    gmDisplayVars();
});
document.getElementById("gm_4D_height_plus").addEventListener("click", function(){
    modifiers[7]++;
    gmDisplayVars();
});
document.getElementById("gm_4D_length_minus").addEventListener("click", function(){
    modifiers[8]--;
    gmDisplayVars();
});
document.getElementById("gm_4D_length_plus").addEventListener("click", function(){
    modifiers[8]++;
    gmDisplayVars();
});
document.getElementById("gm_4D_depth_minus").addEventListener("click", function(){
    modifiers[9]--;
    gmDisplayVars();
});
document.getElementById("gm_4D_depth_plus").addEventListener("click", function(){
    modifiers[9]++;
    gmDisplayVars();
});
document.getElementById("modifiers_directions_button").addEventListener("click", function(){
    if (modifiers[10] == "Orthogonal") modifiers[10] = "Both";
    else if (modifiers[10] == "Both") modifiers[10] = "Diagonal";
    else modifiers[10] = "Orthogonal";
    displayModifiers(3);
});
document.getElementById("modifiers_stayStill_button").addEventListener("click", function(){
    modifiers[11] = !(modifiers[11])
    displayModifiers(3);
});
document.getElementById("modifiers_simpleSpawns_button").addEventListener("click", function(){
    if (modifiers[15] == "Regular") modifiers[15] = "Simple";
    else if (modifiers[15] == "Simple") modifiers[15] = "Equal";
    else modifiers[15] = "Regular";
    displayModifiers(2);
});
document.getElementById("modifiers_garbage0_button").addEventListener("click", function(){
    modifiers[12] = !(modifiers[12])
    displayModifiers(4);
});
document.getElementById("modifiers_negativetiles_button").addEventListener("click", function(){
    if (modifiers[13] == "None") modifiers[13] = "Non-Interacting";
    else if (modifiers[13] == "Non-Interacting") modifiers[13] = "Interacting";
    else modifiers[13] = "None";
    displayModifiers(4);
});
document.getElementById("modifiers_twoMoveMerge_button").addEventListener("click", function(){
    modifiers[20] = !(modifiers[20]);
    displayModifiers(5);
});
document.getElementById("cmenu_return").addEventListener("click", function(){
    switchScreen("Menu", "Main");
});
document.getElementById("modifiers_customGridActivate").addEventListener("click", function() {
    modifiers[5] = "Custom";
    width = 4;
    height = 4;
    directions = [
        [[-1, 0, modifiers[0], 0, [1, true, true]], "&#8593;", 5/33, 5/33, 3/33, 6/33, 14/33, ["ArrowUp", "KeyW"], 0],
        [[1, 0, modifiers[0], 0, [1, true, true]], "&#8595;", 5/33, 5/33, 3/33, 22/33, 14/33, ["ArrowDown", "KeyS"], 0],
        [[0, -1, modifiers[0], 0, [1, true, true]], "&#8592;", 5/33, 5/33, 3/33, 14/33, 6/33, ["ArrowLeft", "KeyA"], 0],
        [[0, 1, modifiers[0], 0, [1, true, true]], "&#8594;", 5/33, 5/33, 3/33, 14/33, 22/33, ["ArrowRight", "KeyD"], 0],
    ];
    directionsAvailable = [true, true, true, true];
    createCustomGrid();
    switchScreen("Modifiers", 3.1);
});
document.getElementById("modifiers_customGridDeactivate").addEventListener("click", function() {
    modifiers[5] = "Square";
    modifiers[10] = "Orthogonal";
    modifiers[11] = false;
    switchScreen("Modifiers", 3);
});
document.getElementById("modifiers_customGridWidth_minus").addEventListener("click", function() {
    width--;
    createCustomGrid();
    displayModifiers(3.1);
});
document.getElementById("modifiers_customGridWidth_plus").addEventListener("click", function() {
    width++;
    createCustomGrid();
    displayModifiers(3.1);
});
document.getElementById("modifiers_customGridHeight_minus").addEventListener("click", function() {
    height--;
    createCustomGrid();
    displayModifiers(3.1);
});
document.getElementById("modifiers_customGridHeight_plus").addEventListener("click", function() {
    height++;
    createCustomGrid();
    displayModifiers(3.1);
});
document.getElementById("modifiers_customArrow_vdir_plus").addEventListener("click", function() {
    directions[screenVars[0]][0][0]++;
    displayModifiers(3.2);
});
document.getElementById("modifiers_customArrow_vdir_minus").addEventListener("click", function() {
    directions[screenVars[0]][0][0]--;
    displayModifiers(3.2);
});
document.getElementById("modifiers_customArrow_hdir_plus").addEventListener("click", function() {
    directions[screenVars[0]][0][1]++;
    displayModifiers(3.2);
});
document.getElementById("modifiers_customArrow_hdir_minus").addEventListener("click", function() {
    directions[screenVars[0]][0][1]--;
    displayModifiers(3.2);
});
document.getElementById("modifiers_customArrow_slideAmount_plus").addEventListener("click", function() {
    if (directions[screenVars[0]][0][2] == Infinity) directions[screenVars[0]][0][2] = 1;
    else directions[screenVars[0]][0][2]++;
    displayModifiers(3.2);
});
document.getElementById("modifiers_customArrow_slideAmount_minus").addEventListener("click", function() {
    if (directions[screenVars[0]][0][2] == 1) directions[screenVars[0]][0][2] = Infinity;
    else directions[screenVars[0]][0][2]--;
    displayModifiers(3.2);
});
document.getElementById("modifiers_customArrow_text_change").addEventListener("change", function() {
    directions[screenVars[0]][1] = he.encode(this.value);
    displayModifiers(3.2);
});
document.getElementById("modifiers_customArrow_width_change").addEventListener("change", function() {
    let v = Number(this.value);
    if (isNaN(v)) v = 0;
    if (v < 0) v = 0;
    if (v > 100) v = 100;
    directions[screenVars[0]][2] = v / 100;
    displayModifiers(3.2);
});
document.getElementById("modifiers_customArrow_height_change").addEventListener("change", function() {
    let v = Number(this.value);
    if (isNaN(v)) v = 0;
    if (v < 0) v = 0;
    if (v > 100) v = 100;
    directions[screenVars[0]][2] = v / 100;
    displayModifiers(3.2);
});
document.getElementById("modifiers_customArrow_fontsize_change").addEventListener("change", function() {
    let v = Number(this.value);
    if (isNaN(v)) v = 0;
    if (v < 0) v = 0;
    if (v > 100) v = 100;
    directions[screenVars[0]][4] = v / 100;
    displayModifiers(3.2);
});
document.getElementById("modifiers_customArrow_vpos_change").addEventListener("change", function() {
    let v = Number(this.value);
    if (isNaN(v)) v = 0;
    if (v < 0) v = 0;
    if (v > 100) v = 100;
    directions[screenVars[0]][5] = v / 100;
    displayModifiers(3.2);
});
document.getElementById("modifiers_customArrow_hpos_change").addEventListener("change", function() {
    let v = Number(this.value);
    if (isNaN(v)) v = 0;
    if (v < 0) v = 0;
    if (v > 100) v = 100;
    directions[screenVars[0]][6] = v / 100;
    displayModifiers(3.2);
});
document.getElementById("modifiers_customArrow_rotation_change").addEventListener("change", function() {
    let v = Number(this.value);
    if (isNaN(v)) v = 0;
    v = mod(v, 360);
    directions[screenVars[0]][8] = v;
    displayModifiers(3.2);
});
document.getElementById("modifiers_customArrow_removeKey").addEventListener("click", function() {
    directions[screenVars[0]][7].pop();
    displayModifiers(3.2);
});
document.getElementById("modifiers_customArrow_addKey").addEventListener("click", function() {
    inputAvailable = !inputAvailable;
    displayModifiers(3.2);
});
document.getElementById("modifiers_customArrow_removeDirection").addEventListener("click", function() {
    if (screenVars[0] > -1) directions.splice(screenVars[0], 1);
    screenVars[0] = -1;
    displayModifiers(3.2);
});
document.getElementById("modifiers_customArrow_addDirection").addEventListener("click", function() {
    directions.push([[0, 0, modifiers[0], 0, 2], "&#8226;", 5/33, 5/33, 3/33, 14/33, 14/33, [], 0]);
    screenVars[0] = directions.length - 1;
    displayModifiers(3.2);
});
document.getElementById("modifiers_emptyAutoMoves_button").addEventListener("click", function() {
    auto_directions.push([[1, 0, Infinity, -1, [-1, true, false, false]], "Between", [1, 0, "@end_vars", ["@var_retain", "@Moves", "-", "@Var 1", "%", "@Var 0", "=", 0], "&&", ["@var_retain", "@Moves", ">=", "@Var 1"]]]);
    screenVars[0] = 0;
    displayModifiers(5);
});
document.getElementById("modifiers_AutoMoves_add").addEventListener("click", function() {
    auto_directions.push([[1, 0, Infinity, -1, [-1, true, false, false]], "Between", [1, 0, "@end_vars", ["@var_retain", "@Moves", "-", "@Var 1", "%", "@Var 0", "=", 0], "&&", ["@var_retain", "@Moves", ">=", "@Var 1"]]]);
    screenVars[0] = auto_directions.length - 1;
    displayModifiers(5);
});
document.getElementById("modifiers_AutoMoves_remove").addEventListener("click", function() {
    auto_directions.splice(screenVars[0], 1);
    if (auto_directions.length == 0) screenVars[0] = -1;
    else if (screenVars[0] >= auto_directions.length) screenVars[0] = auto_directions.length - 1;
    displayModifiers(5);
});
document.getElementById("modifiers_AutoMoves_previous").addEventListener("click", function() {
    if (screenVars[0] == 0) screenVars[0] = auto_directions.length - 1;
    else screenVars[0]--;
    displayModifiers(5);
});
document.getElementById("modifiers_AutoMoves_next").addEventListener("click", function() {
    if (screenVars[0] == auto_directions.length - 1) screenVars[0] = 0;
    else screenVars[0]++;
    displayModifiers(5);
});
document.getElementById("modifiers_AutoMoves_vdir_plus").addEventListener("click", function() {
    auto_directions[screenVars[0]][0][0]++;
    displayModifiers(5);
});
document.getElementById("modifiers_AutoMoves_vdir_minus").addEventListener("click", function() {
    auto_directions[screenVars[0]][0][0]--;
    displayModifiers(5);
});
document.getElementById("modifiers_AutoMoves_hdir_plus").addEventListener("click", function() {
    auto_directions[screenVars[0]][0][1]++;
    displayModifiers(5);
});
document.getElementById("modifiers_AutoMoves_hdir_minus").addEventListener("click", function() {
    auto_directions[screenVars[0]][0][1]--;
    displayModifiers(5);
});
document.getElementById("modifiers_AutoMoves_slideAmount_plus").addEventListener("click", function() {
    if (auto_directions[screenVars[0]][0][2] == Infinity) auto_directions[screenVars[0]][0][2] = 1;
    else auto_directions[screenVars[0]][0][2]++;
    displayModifiers(5);
});
document.getElementById("modifiers_AutoMoves_slideAmount_minus").addEventListener("click", function() {
    if (auto_directions[screenVars[0]][0][2] == 1) auto_directions[screenVars[0]][0][2] = Infinity;
    else auto_directions[screenVars[0]][0][2]--;
    displayModifiers(5);
});
document.getElementById("modifiers_AutoMoves_frequency_plus").addEventListener("click", function() {
    if (auto_directions[screenVars[0]][2][0] == Infinity) auto_directions[screenVars[0]][2][0] = 1;
    else auto_directions[screenVars[0]][2][0]++;
    displayModifiers(5);
});
document.getElementById("modifiers_AutoMoves_frequency_minus").addEventListener("click", function() {
    if (auto_directions[screenVars[0]][2][0] == 1) auto_directions[screenVars[0]][2][0] = Infinity;
    else auto_directions[screenVars[0]][2][0]--;
    displayModifiers(5);
});
document.getElementById("modifiers_AutoMoves_firstTurn_plus").addEventListener("click", function() {
    auto_directions[screenVars[0]][2][1]++;
    displayModifiers(5);
});
document.getElementById("modifiers_AutoMoves_firstTurn_minus").addEventListener("click", function() {
    auto_directions[screenVars[0]][2][1]--;
    displayModifiers(5);
});
document.getElementById("modifiers_AutoMoves_manualStrength_button").addEventListener("click", function(){
    if (auto_directions[screenVars[0]][0][4][0] == 0) {
        auto_directions[screenVars[0]][0][4][0] = -1;
        auto_directions[screenVars[0]][0][4][2] = false;
        auto_directions[screenVars[0]][0][4][3] = false;
    }
    else {
        auto_directions[screenVars[0]][0][4][0] = 0;
        auto_directions[screenVars[0]][0][4][2] = true;
        auto_directions[screenVars[0]][0][4][3] = true;
    }
    displayModifiers(5);
});
document.getElementById("modifiers_AutoMoves_merges_button").addEventListener("click", function(){
    auto_directions[screenVars[0]][0][4][1] = !(auto_directions[screenVars[0]][0][4][1]);
    displayModifiers(5);
});
document.getElementById("modifiers_AutoMoves_timing_button").addEventListener("click", function(){
    if (auto_directions[screenVars[0]][1] == "Between") auto_directions[screenVars[0]][1] = "Before";
    else if (auto_directions[screenVars[0]][1] == "Before") auto_directions[screenVars[0]][1] = "After";
    else auto_directions[screenVars[0]][1] = "Between";
    displayModifiers(5);
});
document.getElementById("guide_return").addEventListener("click", function(){
    switchScreen("Menu", "Main");
});

let currentScreen = "Menu";
let subScreen = "Main";
let screenVars = [];
switchScreen("Menu", "Main");
for (let t = 0; t < 25; t++) { //Adding event listeners to the main mode tiles on the menu
    let mtile = document.getElementById("menu_grid").children[t];
    mtile.style.setProperty("left", "calc(var(--menu_grid_size) * " + ((t % 5) * 14.75 + 1.25) + " / 75)");
    mtile.style.setProperty("top", "calc(var(--menu_grid_size) * " + ((Math.floor(t / 5)) * 14.75 + 1.25) + " / 75)");
    mtile.id = "menu_tile_" + (t + 1);
    if (mtile.innerHTML != "TBA") {
        mtile.addEventListener("click", function(){
            loadMode(t + 1);
            document.getElementById("gm_big_tile").style.setProperty("background-color", getComputedStyle(this).getPropertyValue("background-color"));
            document.getElementById("gm_big_tile").innerHTML = this.innerHTML;
            document.getElementById("gm_big_tile").style.setProperty("background-image", getComputedStyle(this).getPropertyValue("background-image"));
            document.getElementById("gm_big_tile").style.setProperty("--gm_tfs", getComputedStyle(this).getPropertyValue("--tile_font_size") * 1.25);
        });
    }
}
let extra_modes_order = [26, 27, 28, 30, 33, 32, 42, 31, 29, 38, 43, 40, 34, 35, 36, 37, 39, 44, 45, 41]
for (let t = 0; t < document.getElementById("extra_menu_grid").children.length; t++) { //Adding event listeners to the extra mode tiles on the menu
    let mtile = document.getElementById("extra_menu_grid").children[t];
    mtile.style.setProperty("left", "calc(var(--menu_grid_size) * " + ((t % 4) * 14.75 + 1.25) + " / 75)");
    mtile.style.setProperty("top", "calc(var(--menu_grid_size) * " + ((Math.floor(t / 4)) * 14.75 + 1.25) + " / 75)");
    mtile.id = "menu_tile_" + (extra_modes_order[t]);
    if (mtile.innerHTML != "TBA") {
        mtile.addEventListener("click", function(){
            loadMode(extra_modes_order[t]);
            document.getElementById("gm_big_tile").style.setProperty("background-color", getComputedStyle(this).getPropertyValue("background-color"));
            document.getElementById("gm_big_tile").innerHTML = this.innerHTML;
            document.getElementById("gm_big_tile").style.setProperty("background-image", getComputedStyle(this).getPropertyValue("background-image"));
            document.getElementById("gm_big_tile").style.setProperty("--gm_tfs", getComputedStyle(this).getPropertyValue("--tile_font_size") * 1.25);
        });
    }
}
let inputAvailable = true;


//Basic functions
function eqPrimArrays(a1, a2) { //"Equal Primitive Arrays"; tests if two arrays are equal. Only works if the arrays being compared do not contain non-array objects themselves, but works on nested arrays.
    if (!(Array.isArray(a1) && Array.isArray(a2))) return (a1 === a2);
    if (a1.length != a2.length) return false;
    else for (let i = 0; i < a1.length; i++) {
        if (a1[i] != a2[i]) {
            if (!(Array.isArray(a1[i]) && Array.isArray(a2[i])) || !eqPrimArrays(a1[i], a2[i])) return false;
        }
    }
    return true;
}

function indexOfPrimArray(inner, outer) {//Checks for the index of inner within outer; works even when inner is itself an array, and can be used on other things with a length property (like strings)
    if (!("length" in outer) || outer.length == 0) return -1;
    for (let i = 0; i < outer.length; i++) {
        if (eqPrimArrays(outer[i], inner)) return i;
    }
    return -1;
}

function indexOfNestedPrimArray(inner, outer) {//Checks for the index of inner within outer; wworks even when inner is itself an array, and can be used on other things with a length property (like strings). Can find indexes of subarrays; for example, if inner is outer[1][5], then this function will return [1, 5]
    if (!("length" in outer) || outer.length == 0) return -1;
    for (let i = 0; i < outer.length; i++) {
        if (eqPrimArrays(outer[i], inner)) return i;
    }
    for (let i = 0; i < outer.length; i++) {
        let index = -1;
        if (Array.isArray(outer[i])) index = indexOfNestedPrimArray(inner, outer[i]);
        if (index != -1) {
            if (typeof index == "number") return [i, index];
            else {
                let arr = [i]
                return arr.concat(index);
            }
        }
    }
    return -1;
}

function getRndInteger(min, max) { //Taken from W3Schools; returns a random integer between min and max (inclusive).
    if (max < min) return getRndInteger(max, min);
    return Math.floor(Math.random() * (max - min + 1) ) + min;
}

function getRndFloat(min, max) {
    if (max < min) return getRndFloat(max, min);
    return Math.random() * (max - min) + min;
}

function getRndBigInt(min, max) {
    min = BigInt(min);
    max = BigInt(max);
    if (max < min) return getRndBigInt(max, min);
    max++
    let randInt = BigInt(Math.round(Math.random() * Number.MAX_SAFE_INTEGER));
    return (min * BigInt(Number.MAX_SAFE_INTEGER) + (max - min) * randInt) / BigInt(Number.MAX_SAFE_INTEGER);
}

function delay(milliseconds){ //Taken from Alvaro Trigo, only works in an async function
    return new Promise(resolve => {
        setTimeout(resolve, milliseconds);
    });
}

function orders(num) { //Returns an array containing every permutation of "num" numbers
    if (num == 1) return [[0]];
    let prev = orders(num - 1);
    let result = [];
    for (let pos = num - 1; pos >= 0; pos--) {
        for (let e = 0; e < prev.length; e++) {
            let entry = structuredClone(prev[e]);
            entry.splice(pos, 0, num - 1);
            result.push(entry);
        }
    }
    return result;
}

function max(a, b) {//This exists so CalcArray can use max on strings
    if (b > a) return b;
    else return a;
}

function min(a, b) {
    if (b < a) return b;
    else return a;
}

function abs(a) {
    if (a >= 0) return a;
    else if (a < 0 && typeof a == "number") return a * -1;
    else if (a < 0 && typeof a == "bigint") return a * -1n;
    else throw new Error("Invalid argument.");
}

function sign(a) {
    if (typeof a == "number") {
        if (a > 0) return 1;
        else if (a < 0) return -1;
        else if (a == 0) return 0;
        else return NaN;
    }
    else if (typeof a == "bigint") {
        if (a > 0n) return 1n;
        else if (a < 0n) return -1n;
        else if (a == 0n) return 0n;
        else throw new Error("Invalid bigint.")
    }
    else throw new Error("Invalid argument.")
}

function gcd(a, b) { //Made by _saurabh_jaiswal
    // Everything divides 0
    if (b == 0) {
      return a;
    }

    return gcd(b, a % b);
}

function lcm(a, b) {
    return a * b / gcd(a, b);
}

function mod(n, m) { //mod(-1, 8) is 7 rather than -1. Taken from https://stackoverflow.com/questions/4467539/javascript-modulo-gives-a-negative-result-for-negative-numbers
    return ((n % m) + m) % m;
}

function arrayTypes(arr) { //Returns all the types of the entries in the array: an array of all numbers will return ["number"], an array of numbers and strings will return ["number", "string"] or ["string", "number"] depending on which type shows up first, an array of arrays of numbers will return [["number"]]
    if (!(Array.isArray(arr))) return (typeof arr);
    let typeslist = [];
    for (let i = 0; i < arr.length; i++) {
        let entry_type = typeof arr[i];
        if (Array.isArray(arr[i])) entry_type = arrayTypes(arr[i]);
        if (indexOfPrimArray(entry_type, typeslist) == -1) typeslist.push(entry_type);
    }
    return typeslist;
}

function prime(n) {//Returns the nth prime; uses numbers or BigInts depending on the type of the input. prime(-n) is the negative of the nth prime.
    if ((typeof n == "number") && (n % 1 != 0)) return undefined;
    if (n == 0) {
        if (typeof n == "bigint") return 1n;
        else return 1;
    }
    let pn = n;
    if (n < 0) {
        if (typeof n == "bigint") pn *= -1n;
        else pn *= -1;
    }
    let primes = [2];
    let test = 3;
    if (typeof n == "bigint") {
        primes = [2n];
        test = 3n;
    }
    let pcheck = true;
    while (primes.length < pn) {
        pcheck = true;
        for (let p of primes) {
            if (test % p == 0) {
                pcheck = false;
                break;
            }
        }
        if (pcheck) primes.push(test);
        test++;
    }
    let answer = primes.at(-1);
    if (answer < 0) {
        if (typeof n == "bigint") answer *= -1n;
        else answer *= -1;
    }
    return answer;
}

function expomod(n, m) { //How many factors of m are in n? 7 expomod 2 is 0, 6 expomod 2 is 1, 12 expomod 2 is 2, 1250 expomod 5 is 4, and so on. Returns -1 for invalid inputs. Works on numbers and bigints; n and m must have matching types. Only works on whole numbers.
    if (typeof n != typeof m || (typeof n != "number" && typeof n != "bigint")) return -1;
    if (typeof n == "number" && (n % 1 != 0 || m % 1 != 0)) return -1;
    if (typeof n == "number" && (n == 0 || m == 1)) return Infinity;
    if (typeof n == "bigint" && (n == 0n || m == 1n)) return -1;
    let result = 0;
    while (n % m == 0) {
        n /= m;
        result++;
    }
    return result;
}

function factorial(n) {//Accepts both numbers and bigints, but whole numbers only.
    if (typeof n == "bigint") {
        if (n < 0n) return NaN;
        if (n == 0n) return 1n;
        else return n * factorial(n - 1n);
    }
    else {
        n = Number(n);
        if (Number.isNaN(n) || n < 0n) return NaN;
        n = Math.round(n);
        if (n > 175) return Infinity;
        if (n == 0) return 1;
        else return n * factorial(n - 1);
    }
}

function string_splice(input, start, length) { //Basically the splice method, but on strings instead of arrays. Returns a new string since strings are immutable
    let insert = "";
    if (arguments.length > 3) insert = arguments[3];
    let str = String(input);
    result = str.slice(0, start);
    result += insert;
    result += str.slice(start + length);
    return result;
}

function iroot(base, root) { // nth root for bigints; taken from https://stackoverflow.com/questions/64190185/how-do-i-extract-the-nth-root-of-a-bigint-in-javascript
    if (typeof base !== 'bigint' || typeof root !== 'bigint') throw new Error("Arguments must be bigints.");
  
    let s = base + 1n;
    let k1 = root - 1n;
    let u = base;
    while (u < s) {
      s = u;
      u = ((u*k1) + base / (u ** k1)) / root;
    }
    return s;
}

function ilog(num, base) { //logarithm for bigints
    if (typeof num !== 'bigint' || typeof base !== 'bigint') throw new Error("Arguments must be bigints.");
    let result = 0n;
    while (num > 1) {
        num /= base;
        result++;
    }
}

function deepArrayReplace(entry, replacement, array) { // Replaces all occurances of the given entry in the given array with the replacement, including in nested subarrays.
    if (Array.isArray(array)) {
        for (let i = 0; i < array.length; i++) array[i] = deepArrayReplace(entry, replacement, array[i]);
    }
    else {
        if (array == entry) return replacement;
    }
    return array;
}

function abbreviateNumber(num, system, decimals, commas, ...more) {
    if (num == 0) return "0";
    if (system == "Number") {
        if (commas) {
        let sign = Math.sign(num);
        let whole = String(Math.abs(Math.trunc(num)));
        if (more.length > 0 && more[0]) {
            decimals = Math.max(decimals - Math.floor(Math.log10(Math.abs(num))), 0);
        }
        let decimal = String(Math.round(Math.abs(num - Math.trunc(num)) * 10**decimals) / 10**decimals);
        let result = "";
        let result_frag = "";
        while (whole.length > 3) {
            result_frag = whole.slice(whole.length - 3);
            whole = whole.slice(0, whole.length - 3);
            result = "," + result_frag + result;
        }
        result = whole + result + decimal.slice(1);
        if (sign == -1) result = "-" + result;
        return result;
        }
        else return String(Math.round(num * 10**decimals)/10**decimals);
    }
    else if (system == "Standard" || system == "SI") {
        let illions = [];
        let little_illions = [];
        if (system == "Standard") {
            illions = ["", "k", "M", "B", "T", "Qa", "Qi", "Sx", "Sp", "Oc", "No", "Dc", "UDc", "DDc", "TDc", "QaDc", "QiDc", "SxDc", "SpDc", "ODc", "NDc", "Vg", "UVg", "DVg", "TVg", "QaVg", "QiVg", "SxVg", "SpVg", "OVg", "NVg", "Tg", "UTg", "DTg", "TTg", "QaTg", "QiTg", "SxTg", "SpTg", "OTg", "NTg", "Qg", "UQg", "DQg", "TQg", "QaQg", "QiQg", "SxQg", "SpQg", "OQg", "NQg", "Qq", "UQq", "DQq", "TQq", "QaQq", "QiQq", "SxQq", "SpQq", "OQq", "NQq", "Sg", "USg", "DSg", "TSg", "QaSg", "QiSg", "SxSg", "SpSg", "OSg", "NSg", "St", "USt", "DSt", "TSt", "QaSt", "QiSt", "SxSt", "SpSt", "OSt", "NSt", "Og", "UOg", "DOg", "TOg", "QaOg", "QiOg", "SxOg", "SpOg", "OOg", "NOg", "Ng", "UNg", "DNg", "TNg", "QaNg", "QiNg", "SxNg", "SpNg", "ONg", "NNg", "Cn", "UCn"];
            little_illions = illions.map(function(i){return "/" + i;})
        }
        else if (system == "SI") {
            illions = ["", "k", "M", "G", "T", "P", "E", "Z", "Y", "R", "Q", "kQ", "MQ", "GQ", "TQ", "PQ", "EQ", "ZQ", "YQ", "RQ", "QQ", "kQQ", "MQQ", "GQQ", "TQQ", "PQQ", "EQQ", "ZQQ", "YQQ", "RQQ", "QQQ", "kQQQ", "MQQQ", "GQQQ", "TQQQ", "PQQQ", "EQQQ", "ZQQQ", "YQQQ", "RQQQ", "QQQQ", "kQQQQ", "MQQQQ", "GQQQQ", "TQQQQ", "PQQQQ", "EQQQQ", "ZQQQQ", "YQQQQ", "RQQQQ", "Q<sup>5</sup>", "kQ<sup>5</sup>", "MQ<sup>5</sup>", "GQ<sup>5</sup>", "TQ<sup>5</sup>", "PQ<sup>5</sup>", "EQ<sup>5</sup>", "ZQ<sup>5</sup>", "YQ<sup>5</sup>", "RQ<sup>5</sup>", "Q<sup>6</sup>", "kQ<sup>6</sup>", "MQ<sup>6</sup>", "GQ<sup>6</sup>", "TQ<sup>6</sup>", "PQ<sup>6</sup>", "EQ<sup>6</sup>", "ZQ<sup>6</sup>", "YQ<sup>6</sup>", "RQ<sup>6</sup>", "Q<sup>7</sup>", "kQ<sup>7</sup>", "MQ<sup>7</sup>", "GQ<sup>7</sup>", "TQ<sup>7</sup>", "PQ<sup>7</sup>", "EQ<sup>7</sup>", "ZQ<sup>7</sup>", "YQ<sup>7</sup>", "RQ<sup>7</sup>", "Q<sup>8</sup>", "kQ<sup>8</sup>", "MQ<sup>8</sup>", "GQ<sup>8</sup>", "TQ<sup>8</sup>", "PQ<sup>8</sup>", "EQ<sup>8</sup>", "ZQ<sup>8</sup>", "YQ<sup>8</sup>", "RQ<sup>8</sup>", "Q<sup>9</sup>", "kQ<sup>9</sup>", "MQ<sup>9</sup>", "GQ<sup>9</sup>", "TQ<sup>9</sup>", "PQ<sup>9</sup>", "EQ<sup>9</sup>", "ZQ<sup>9</sup>", "YQ<sup>9</sup>", "RQ<sup>9</sup>", "Q<sup>10</sup", "kQ<sup>10</sup", "MQ<sup>10</sup"];
            little_illions = ["", "m", "&#181;", "n", "p", "f", "a", "z", "y", "r", "q", "mq", "&#181;q", "nq", "pq", "fq", "aq", "zq", "yq", "rq", "qq", "mqq", "&#181;qq", "nqq", "pqq", "fqq", "aqq", "zqq", "yqq", "rqq", "qqq", "mqqq", "&#181;qqq", "nqqq", "pqqq", "fqqq", "aqqq", "zqqq", "yqqq", "rqqq", "qqqq", "mqqqq", "&#181;qqqq", "nqqqq", "pqqqq", "fqqqq", "aqqqq", "zqqqq", "yqqqq", "rqqqq", "qqqqq", "q<sup>5</sup>", "kq<sup>5</sup>", "&#181;q<sup>5</sup>", "nq<sup>5</sup>", "pq<sup>5</sup>", "fq<sup>5</sup>", "aq<sup>5</sup>", "zq<sup>5</sup>", "yq<sup>5</sup>", "rq<sup>5</sup>", "q<sup>6</sup>", "kq<sup>6</sup>", "&#181;q<sup>6</sup>", "nq<sup>6</sup>", "pq<sup>6</sup>", "fq<sup>6</sup>", "aq<sup>6</sup>", "zq<sup>6</sup>", "yq<sup>6</sup>", "rq<sup>6</sup>", "q<sup>7</sup>", "kq<sup7</sup>", "&#181;q<sup>7</sup>", "nq<sup>7</sup>", "pq<sup>7</sup>", "fq<sup>7</sup>", "aq<sup>7</sup>", "zq<sup>7</sup>", "yq<sup>7</sup>", "rq<sup>7</sup>", "q<sup>8</sup>", "kq<sup>8</sup>", "&#181;q<sup>8</sup>", "nq<sup>8</sup>", "pq<sup>8</sup>", "fq<sup>8</sup>", "aq<sup>8</sup>", "zq<sup>8</sup>", "yq<sup>8</sup>", "rq<sup>8</sup>", "q<sup>9</sup>", "kq<sup>9</sup>", "&#181;q<sup>9</sup>", "nq<sup>9</sup>", "pq<sup>9</sup>", "fq<sup>9</sup>", "aq<sup>9</sup>", "zq<sup>9</sup>", "yq<sup>9</sup>", "rq<sup>9</sup>", "q<sup>10</sup>", "kq<sup>10</sup>", "&#181;q<sup>10</sup>"]
        }
        let whole = Math.abs(num);
        let power = 0;
        let chosen = "";
        if (more.length < 2 || more[1] <= 0) power = Math.floor(Math.log10(whole) / 3) * 3;
        else power = Math.floor((Math.log10(whole) - more[1]) / 3) * 3;
        whole = whole / 10**power;
        if (more.length > 0 && more[0]) {
            decimals = Math.max(decimals - Math.floor(Math.log10(Math.abs(whole))), 0);
        }
        whole = Math.round(whole * 10**decimals) / 10**decimals;
        power /= 3;
        if (power > 0) chosen = " " + illions[power];
        else if (power < 0) chosen = little_illions[Math.abs(power)];
        let result = abbreviateNumber(whole, "Number", decimals, commas, ...more) + chosen;
        if (num < 0) result = "-" + result;
        return result;
    }
    else if (system == "Scientific") {
        let whole = Math.abs(num);
        let power = Math.floor(Math.log10(whole));
        if (more.length > 1) power -= more[1];
        whole = whole / 10**power;
        if (more.length > 0 && more[0]) {
            decimals = Math.max(decimals - Math.floor(Math.log10(Math.abs(whole))), 0);
        }
        let result = abbreviateNumber(whole, "Number", decimals, commas, ...more) + " &#215; 10<sup>" + power + "</sup>";
        if (num < 0) result = "-" + result;
        return result;
    }
    else if (system == "BigInt") {
        num = BigInt(num);
        if (!commas) return String(num);
        let negative = false;
        if (num < 0n) {
            negative = true;
            num *= -1n;
        }
        num = String(num);
        let result = "";
        let piece = "";
        while (num.length > 3) {
            piece = num.slice(num.length - 3);
            num = num.slice(0, num.length - 3);
            result = "," + piece + result;
        }
        result = num + result;
        if (negative) result = "-" + result;
        return result;
    }
}


//Menu navigation
function switchScreen(screen, subscreen) {
    currentScreen = screen;
    subScreen = subscreen;
    document.getElementById("game_over_screen").style.setProperty("display", "none");
    document.getElementById("win_screen").style.setProperty("display", "none");
    if (screen == "Menu") {
        document.getElementById("menu").style.setProperty("display", "block");
        document.getElementById("gamemode").style.setProperty("display", "none");
        document.getElementById("modifiers").style.setProperty("display", "none");
        document.getElementById("gameplay").style.setProperty("display", "none");
        document.getElementById("save_code").style.setProperty("display", "none");
        document.getElementById("custom").style.setProperty("display", "none"); //This screen is currently unimplemented, but who knows if I can safely remove it? Code is weird like that
        document.getElementById("guide").style.setProperty("display", "none");
        if (subScreen == "Extra") {
            document.documentElement.style.setProperty("background-image", "linear-gradient(90deg, #787800, #004675)");
            document.getElementById("menu_grid").style.setProperty("display", "none");
            document.getElementById("extra_menu_container").style.setProperty("display", "inline-block");
            document.getElementById("menu_extra").style.setProperty("display", "none");
            document.getElementById("menu_extra_return").style.setProperty("display", "flex");
            document.getElementById("menu_subtitle").innerHTML = "Extra Modes";
        }
        else {
            document.documentElement.style.setProperty("background-image", "linear-gradient(90deg, #ffff00, #0099ff)");
            document.getElementById("menu_grid").style.setProperty("display", "inline-block");
            document.getElementById("extra_menu_container").style.setProperty("display", "none");
            document.getElementById("menu_extra").style.setProperty("display", "flex");
            document.getElementById("menu_extra_return").style.setProperty("display", "none");
            document.getElementById("menu_subtitle").innerHTML = "Click on one of the tiles here to select that game mode.";
        }
    }
    else if (screen == "Gamemode") {
        document.getElementById("menu").style.setProperty("display", "none");
        document.getElementById("gamemode").style.setProperty("display", "block");
        document.getElementById("modifiers").style.setProperty("display", "none");
        document.getElementById("gameplay").style.setProperty("display", "none");
        document.getElementById("save_code").style.setProperty("display", "none");
        document.getElementById("custom").style.setProperty("display", "none");
        document.getElementById("guide").style.setProperty("display", "none");
        if (modifiers[5] == "Diamond" || modifiers[5] == "Hexagon") {
            document.getElementById("gm_size_line").style.setProperty("display", "none");
            document.getElementById("gm_diamond_line").style.setProperty("display", "flex");
            document.getElementById("gm_4D_line").style.setProperty("display", "none");
        }
        else if (modifiers[5] == "4D") {
            document.getElementById("gm_size_line").style.setProperty("display", "none");
            document.getElementById("gm_diamond_line").style.setProperty("display", "none");
            document.getElementById("gm_4D_line").style.setProperty("display", "flex");
        }
        else if (modifiers[5] == "Custom") {
            document.getElementById("gm_size_line").style.setProperty("display", "none");
            document.getElementById("gm_diamond_line").style.setProperty("display", "none");
            document.getElementById("gm_4D_line").style.setProperty("display", "none");
        }
        else {
            document.getElementById("gm_size_line").style.setProperty("display", "flex");
            document.getElementById("gm_diamond_line").style.setProperty("display", "none");
            document.getElementById("gm_4D_line").style.setProperty("display", "none");
        }
    }
    else if (screen == "Modifiers") {
        document.getElementById("menu").style.setProperty("display", "none");
        document.getElementById("gamemode").style.setProperty("display", "none");
        document.getElementById("modifiers").style.setProperty("display", "block");
        document.getElementById("gameplay").style.setProperty("display", "none");
        document.getElementById("save_code").style.setProperty("display", "none");
        document.getElementById("custom").style.setProperty("display", "none");
        document.getElementById("guide").style.setProperty("display", "none");
        document.documentElement.style.setProperty("background-image", "linear-gradient(#ffcf88, #ffed88 30% 70%, #ffcf88)");
        if (subScreen == 3.2) {
            screenVars = [-1];
            inputAvailable = false;
            createCustomArrows();
        }
        if (subScreen == 5) {
            if (auto_directions.length == 0) screenVars = [-1];
            else screenVars = [0];
        }
        displayModifiers(subscreen);
    }
    else if (screen == "Gameplay") {
        document.getElementById("menu").style.setProperty("display", "none");
        document.getElementById("gamemode").style.setProperty("display", "none");
        document.getElementById("modifiers").style.setProperty("display", "none");
        document.getElementById("gameplay").style.setProperty("display", "block");
        document.getElementById("save_code").style.setProperty("display", "none");
        document.getElementById("custom").style.setProperty("display", "none");
        document.getElementById("guide").style.setProperty("display", "none");
        let dispbackground = evaluateColor(getComputedStyle(document.documentElement).getPropertyValue("--background-color"), 0, 0);
            if (dispbackground.includes("gradient")) {
                document.documentElement.style.setProperty("background-image", dispbackground);
            }
            else {
                document.documentElement.style.setProperty("background-image", "none");
            }
            let gridcolor = evaluateColor(getComputedStyle(document.documentElement).getPropertyValue("--grid-color"), 0, 0);
            if (gridcolor.includes("gradient")) {
                document.getElementById("grid").style.setProperty("background-image", gridcolor);
            }
            else {
                document.getElementById("grid").style.setProperty("background-image", "none");
            }
    }
    else if (screen == "SaveCode") {
        document.getElementById("menu").style.setProperty("display", "none");
        document.getElementById("gamemode").style.setProperty("display", "none");
        document.getElementById("modifiers").style.setProperty("display", "none");
        document.getElementById("gameplay").style.setProperty("display", "none");
        document.getElementById("save_code").style.setProperty("display", "block");
        document.getElementById("custom").style.setProperty("display", "none");
        document.getElementById("guide").style.setProperty("display", "none");
        document.documentElement.style.setProperty("background-image", "linear-gradient(#5b0085, #ae00ff, #5b0085)");
        if (subscreen == "Export") {
            displayRules("save_code_heading", ["h2", "Export Save Code"], ["p", 'Copy this save code, then if you want to resume your game at a later time, click the "Resumed Saved Game" button on the menu and paste the code there.']);
            document.getElementById("save_code_return_game").style.setProperty("display", "inline-block");
            document.getElementById("save_code_return_menu").style.setProperty("display", "none");
            document.getElementById("save_code_import").style.setProperty("display", "none");
        }
        else {
            displayRules("save_code_heading", ["h2", "Import Save Code"], ["p", 'Paste your save code in the text box below, then click "Import Save Code" to resume your saved game.']);
            document.getElementById("save_code_return_game").style.setProperty("display", "none");
            document.getElementById("save_code_return_menu").style.setProperty("display", "inline-block");
            document.getElementById("save_code_import").style.setProperty("display", "inline-block");
        }
    }
    else if (screen == "Guide") {
        document.getElementById("menu").style.setProperty("display", "none");
        document.getElementById("gamemode").style.setProperty("display", "none");
        document.getElementById("modifiers").style.setProperty("display", "none");
        document.getElementById("gameplay").style.setProperty("display", "none");
        document.getElementById("save_code").style.setProperty("display", "none");
        document.getElementById("custom").style.setProperty("display", "none");
        document.getElementById("guide").style.setProperty("display", "block");
        document.documentElement.style.setProperty("background-image", "radial-gradient(#00552f, #00e980)");
    }
}

function loadMode(mode) {
    gamemode = mode;
    switchScreen("Gamemode", mode);
    document.getElementById("gm_big_tile").style.setProperty("--gm_tfs", "6");
    statBoxes = [["Score", "@Score"]];
    mode_vars = [];
    start_game_vars = [];
    scripts = [];
    loseConditions = [];
    loseRequirement = false;
    movementParameters = ["@VDir", "@HDir", "@SlideAmount"];
    postgameAllowed = true;
    document.getElementById("mode_vars_line").style.setProperty("display", "none");
    for (let c of document.getElementById("mode_vars_line").children) c.style.setProperty("display", "none");
    if (modifiers[5] == "Custom") { //Part 1 of forcing the custom grid past the modes' width and height changes
        modifiers[6] = width;
        modifiers[7] = height;
    }
    if (mode == 1) { // 2048
        width = 4; height = 4; min_dim = 2;
        TileNumAmount = 1;
        TileTypes = [[[0], 1, "#ffffff", "#776e65"], [[1], 2, "#f9eee3", "#776e65"], [[2], 4, "#ede0c8", "#776e65"], [[3], 8, "#f2b179", "#f9f6f2"],
        [[4], 16, "#f59563", "#f9f6f2"], [[5], 32, "#f67c5f", "#f9f6f2"], [[6], 64, "#f65e3b", "#f9f6f2"], [[7], 128, "#edcf72", "#f9f6f2"],
        [[8], 256, "#edcc61", "#f9f6f2"], [[9], 512, "#edc850", "#f9f6f2"], [[10], 1024, "#edc53f", "#f9f6f2"], [[11], 2048, "#edc22e", "#f9f6f2"],
        [[12], 4096, "#f29eff", "#f9f6f2"], [[13], 8192, "#eb75fd", "#f9f6f2"], [[14], 16384, "#e53bff", "#f9f6f2"], [[15], 32768, "#bd00db", "#f9f6f2"],
        [[16], 65536, "#770089", "#f9f6f2"], [[17], 131072, "#534de8", "#f9f6f2"], [[18], 262144, "#2922e1", "#f9f6f2"], [[19], 524288, "#0a05b6", "#f9f6f2"],
        [true, [2, "^", "@This 0"], ["@HSLA", [-15, "*", "@This 0", "+", 520], 100, [0.9, "^", ["@This 0", "-", 20], "*", 36], 1], "#f9f6f2"]];
        MergeRules = [[2, ["@Next 1 0", "=", "@This 0"], true, [[["@This 0", "+", 1]]], [2, "^", ["@This 0", "+", 1]], [false, true]]];
        startTileSpawns = [[[0], 85], [[1], 12], [[2], 3]];
        winConditions = [[11]];
        winRequirement = 1;
        mode_vars = [false]; //If this is true, TileSpawns is changed to the spawns of the original 2048
        document.documentElement.style.setProperty("background-image", "radial-gradient(#ffc400 0%, #fff 150%)");
        document.documentElement.style.setProperty("--background-color", "#fff5da");
        document.documentElement.style.setProperty("--grid-color", "#c7bea7");
        document.documentElement.style.setProperty("--tile-color", "#ece0c2");
        document.documentElement.style.setProperty("--text-color", "#524c46");
        displayRules("rules_text", ["h2", "Powers of 2"], ["h1", "2048"], ["p", "Merges occur between two tiles of the same number. Get to the 2048 tile to win!"],
        ["p", "Spawning tiles: 1 (85%), 2 (12%), 4 (3%)"]);
        displayRules("gm_rules_text", ["h2", "Powers of 2"], ["h1", "2048"], ["p", "Merges occur between two tiles of the same number. Get to the 2048 tile to win!"],
        ["p", "Spawning tiles: 1 (85%), 2 (12%), 4 (3%)"]);
        document.getElementById("mode_vars_line").style.setProperty("display", "block");
        document.getElementById("2048_vars").style.setProperty("display", "flex");
    }
    else if (mode == 2) { // 2187
        width = 4; height = 4; min_dim = 2;
        TileNumAmount = 2;
        TileTypes = [[[0, 1], 1, "#ffffff", "#584153"], [[0, 2], 2, "#999999", "#f6ebf4"], [[1, 1], 3, "#ffffa2", "#584153"], [[1, 2], 6, "#e6e600", "#f6ebf4"],
        [[2, 1], 9, "#ff8181", "#584153"], [[2, 2], 18, "#ff0000", "#f6ebf4"], [[3, 1], 27, "#ffb96f", "#584153"], [[3, 2], 54, "#ff8400", "#f6ebf4"],
        [[4, 1], 81, "#6d62ff", "#584153"], [[4, 2], 162, "#0f00e4", "#f6ebf4"], [[5, 1], 243, "#96ff69", "#584153"], [[5, 2], 486, "#42dd00", "#f6ebf4"],
        [[6, 1], 729, "#e07bff", "#584153"], [[6, 2], 1458, "#bf00fa", "#f6ebf4"], [[7, 1], 2187, "#ff5ae6", "#584153"], [[7, 2], 4374, "#d600b6", "#f6ebf4"],
        [[8, 1], 6561, "#ffda69", "#584153"], [[8, 2], 13122, "#ffbf00", "#f6ebf4"], [[9, 1], 19683, "#e5ff7c", "#584153"], [[9, 2], 39366, "#ccff00", "#f6ebf4"],
        [[10, 1], 59049, "#78fdff", "#584153"], [[10, 2], 118098, "#00d7da", "#f6ebf4"], [[11, 1], 177147, "#ff896e", "#584153"], [[11, 2], 354294, "#e55000", "#f6ebf4"],
        [[12, 1], 531441, "#6baeff", "#584153"], [[12, 2], 1062882, "#0073ff", "#f6ebf4"],
        [["@This 1", "=", 1], [3, "^", "@This 0"], ["@HSLA", [97, "*", "@This 0", "-", 1111], [0.9, "^", ["@This 0", "-", 12], "*", 100], 70, 1], "#584153"],
        [["@This 1", "=", 2], [3, "^", "@This 0", "*", 2], ["@HSLA", [97, "*", "@This 0", "-", 1111], [0.9, "^", ["@This 0", "-", 12], "*", 100], 35, 1], "#f6ebf4"]];
        MergeRules = [
            [2, [["@Next 1 0", "=", "@This 0"], "&&", ["@Next 1 1", "=", 1], "&&", ["@This 1", "=", 1]], true, [["@This 0", 2]], [3, "^", "@This 0", "*", 2], [false, true]],
            [2, [["@Next 1 0", "=", "@This 0"], "&&", ["@Next 1 1", "=", 2], "&&", ["@This 1", "=", 1]], false, [[["@This 0", "+", 1], 1]], [3, "^", ["@This 0", "+", 1]], [false, true]]];
        startTileSpawns = [[[0, 1], 85], [[0, 2], 10], [[1, 1], 5]];
        winConditions = [[7, 1]];
        winRequirement = 1;
        document.documentElement.style.setProperty("background-image", "radial-gradient(#ff00d9 0%, #fff 150%)");
        document.documentElement.style.setProperty("--background-color", "#ffdaf9");
        document.documentElement.style.setProperty("--grid-color", "#c7a7c4");
        document.documentElement.style.setProperty("--tile-color", "#ecc2e6");
        document.documentElement.style.setProperty("--text-color", "#3c2237");
        displayRules("rules_text", ["h2", "Powers of 3"], ["h1", "2187"], ["p","Merges occur between two tiles that are both the same number and a power of 3, and between one tile that is a power of three and one tile that is double that power of three. Get to the 2187 tile to win!"],
        ["p", "Spawning tiles: 1 (85%), 2 (10%), 3 (5%)"]);
        displayRules("gm_rules_text", ["h2", "Powers of 3"], ["h1", "2187"], ["p","Merges occur between two tiles that are both the same number and a power of 3, and between one tile that is a power of three and one tile that is double that power of three. Get to the 2187 tile to win!"],
        ["p", "Spawning tiles: 1 (85%), 2 (10%), 3 (5%)"]);
    }
    else if (mode == 3) { // 1024
        width = 5; height = 5; min_dim = 3;
        TileNumAmount = 2;
        TileTypes = [[[0, 1], 1, "#ffffff", "#564040"], [[0, 3], 3, "#777777", "#f4ecec"], [[1, 1], 4, "#00ff00", "#564040"], [[1, 3], 12, "#008a00", "#f4ecec"],
        [[2, 1], 16, "#bbff00", "#564040"], [[2, 3], 48, "#78a400", "#f4ecec"], [[3, 1], 64, "#ffc800", "#564040"], [[3, 3], 192, "#997800", "#f4ecec"],
        [[4, 1], 256, "#ff7300", "#564040"], [[4, 3], 768, "#924200", "#f4ecec"], [[5, 1], 1024, "#ff0000", "#564040"], [[5, 3], 3072, "#950000", "#f4ecec"],
        [[6, 1], 4096, "#ff009d", "#564040"], [[6, 3], 12288, "#870053", "#f4ecec"], [[7, 1], 16384, "#f900fe", "#564040"], [[7, 3], 49152, "#88008a", "#f4ecec"],
        [[8, 1], 65536, "#6f00ff", "#564040"], [[8, 3], 196608, "#3c008a", "#f4ecec"], [[9, 1], 262144, "#004cff", "#564040"], [[9, 3], 786432, "#002886", "#f4ecec"],
        [[10, 1], 1048576, "#01d0ff", "#564040"], [[10, 3], 3145728, "#00748e", "#f4ecec"], [[11, 1], 4194304, "#00ffae", "#564040"],
        [[11, 3], 12582912, "#009969", "#f4ecec"],
        [["@This 1", "=", 1], [4, "^", "@This 0"], ["@HSLA", [-31, "*", "@This 0", "+", 491], [0.95, "^", ["@This 0", "-", 12], "*", 75], 70, 1], "#564040"],
        [["@This 1", "=", 3], [4, "^", "@This 0", "*", 3], ["@HSLA", [-31, "*", "@This 0", "+", 491], [0.95, "^", ["@This 0", "-", 12], "*", 75], 35, 1], "#f4ecec"]];
        MergeRules = [
            [3, [["@Next 1 0", "=", "@This 0"], "&&", ["@Next 2 0", "=", "@This 0"], "&&", ["@Next 1 1", "=", 1], "&&", ["@Next 2 1", "=", 1], "&&", ["@This 1", "=", 1]], true, [["@This 0", 3]], [4, "^", "@This 0", "*", 3], [false, true, true]],
            [2, [["@Next 1 0", "=", "@This 0"], "&&", ["@Next 1 1", "=", 3], "&&", ["@This 1", "=", 1]], false, [[["@This 0", "+", 1], 1]], [4, "^", ["@This 0", "+", 1]], [false, true]]];
        startTileSpawns = [[[0, 1], 85], [[0, 3], 10], [[1, 1], 5]];
        winConditions = [[5, 1]];
        winRequirement = 1;
        document.documentElement.style.setProperty("background-image", "radial-gradient(#ff0000 0%, #fff 150%)");
        document.documentElement.style.setProperty("--background-color", "#ffdada");
        document.documentElement.style.setProperty("--grid-color", "#c7a7a7");
        document.documentElement.style.setProperty("--tile-color", "#ecc2c2");
        document.documentElement.style.setProperty("--text-color", "#564040");
        displayRules("rules_text", ["h2", "Powers of 4"], ["h1", "1024"], ["p","Merges occur between three tiles that are both the same number and a power of 4, and between one tile that is a power of four and one tile that is triple that power of four. Get to the 1024 tile to win!"],
        ["p", "Spawning tiles: 1 (85%), 2 (10%), 4 (5%)"]);
        displayRules("gm_rules_text", ["h2", "Powers of 4"], ["h1", "1024"], ["p","Merges occur between three tiles that are both the same number and a power of 4, and between one tile that is a power of four and one tile that is triple that power of four. Get to the 1024 tile to win!"],
        ["p", "Spawning tiles: 1 (85%), 2 (10%), 4 (5%)"]);
    }
    else if (mode == 4) { // 3125
        width = 4; height = 4; min_dim = 2;
        TileNumAmount = 2;
        TileTypes = [[[0, 1], 1, "#ffffff", "#505246"], [[0, 2], 2, "#c6c6c6", "#505246"], [[0, 3], 3, "#898989", "#f4f7e9"], [[0, 4], 4, "#5f5f5f", "#f4f7e9"],
        [[1, 1], 5, "#ff9f9f", "#505246"], [[1, 2], 10, "#ff7272", "#505246"], [[1, 3], 15, "#ff3a3a", "#f4f7e9"], [[1, 4], 20, "#d50000", "#f4f7e9"],
        [[2, 1], 25, "#9fa2ff", "#505246"], [[2, 2], 50, "#5e64ff", "#505246"], [[2, 3], 75, "#0d15ff", "#f4f7e9"], [[2, 4], 100, "#0006be", "#f4f7e9"],
        [[3, 1], 125, "#fffa9f", "#505246"], [[3, 2], 250, "#fff53f", "#505246"], [[3, 3], 375, "#ebdf00", "#f4f7e9"], [[3, 4], 500, "#b3aa00", "#f4f7e9"],
        [[4, 1], 625, "#df9fff", "#505246"], [[4, 2], 1250, "#cf6fff", "#505246"], [[4, 3], 1875, "#bc35ff", "#f4f7e9"], [[4, 4], 2500, "#9900e5", "#f4f7e9"],
        [[5, 1], 3125, "#e9ff9f", "#505246"], [[5, 2], 6250, "#dafe65", "#505246"], [[5, 3], 9375, "#c9ff16", "#f4f7e9"], [[5, 4], 12500, "#abe000", "#f4f7e9"],
        [[6, 1], 15625, "#ff9fda", "#505246"], [[6, 2], 31250, "#ff69c5", "#505246"], [[6, 3], 46875, "#ff23ab", "#f4f7e9"], [[6, 4], 62500, "#eb0091", "#f4f7e9"],
        [[7, 1], 78125, "#9fffbf", "#505246"], [[7, 2], 152650, "#5aff91", "#505246"], [[7, 3], 234375, "#0aff5c", "#f4f7e9"], [[7, 4], 312500, "#00d547", "#f4f7e9"],
        [[8, 1], 390625, "#ffc19f", "#505246"], [[8, 2], 781250, "#ff9a63", "#505246"], [[8, 3], 1171875, "#ff772e", "#f4f7e9"], [[8, 4], 1562500, "#ff5900", "#f4f7e9"],
        [[9, 1], 1953125, "#9ff4ff", "#505246"], [[9, 2], 3906250, "#63edff", "#505246"], [[9, 3], 5859375, "#00e1ff", "#f4f7e9"], [[9, 4], 7812500, "#00c7e1", "#f4f7e9"],
        [[10, 1], 9765625, "#ffe79f", "#505246"], [[10, 2], 19531250, "#ffd65d", "#505246"], [[10, 3], 29296875, "#ffcd36", "#f4f7e9"], [[10, 4], 39062500, "#ebb000", "#f4f7e9"],
        [[11, 1], 48828125, "#9fc2ff", "#505246"], [[11, 2], 97656250, "#659eff", "#505246"], [[11, 3], 146484375, "#1e71ff", "#f4f7e9"], [[11, 4], 195312500, "#0058ef", "#f4f7e9"],
        [["@This 1", "=", 1], [5, "^", "@This 0"], ["@HSLA", [23.5, "*", "@This 0", "-", 212, "+", ["@This 0", "%", 2, "*", 156.5]], [0.95, "^", ["@This 0", "-", 12], "*", 75], 70, 1], "#505246"],
        [["@This 1", "=", 2], [5, "^", "@This 0", "*", 2], ["@HSLA", [23.5, "*", "@This 0", "-", 212, "+", ["@This 0", "%", 2, "*", 156.5]], [0.95, "^", ["@This 0", "-", 12], "*", 75], 60, 1], "#505246"],
        [["@This 1", "=", 3], [5, "^", "@This 0", "*", 3], ["@HSLA", [23.5, "*", "@This 0", "-", 212, "+", ["@This 0", "%", 2, "*", 156.5]], [0.95, "^", ["@This 0", "-", 12], "*", 75], 50, 1], "#f4f7e9"],
        [["@This 1", "=", 4], [5, "^", "@This 0", "*", 4], ["@HSLA", [23.5, "*", "@This 0", "-", 212, "+", ["@This 0", "%", 2, "*", 156.5]], [0.95, "^", ["@This 0", "-", 12], "*", 75], 40, 1], "#f4f7e9"]];
        MergeRules = [
            [2, [["@Next 1 0", "=", "@This 0"], "&&", ["@Next 1 1", "+", "@This 1", "<", 5]], true, [["@This 0", ["@Next 1 1", "+", "@This 1"]]], [5, "^", "@This 0", "*", ["@Next 1 1", "+", "@This 1"]], [false, true]],
            [2, [["@Next 1 0", "=", "@This 0"], "&&", ["@Next 1 1", "+", "@This 1", "=", 5]], true, [[["@This 0", "+", 1], 1]], [5, "^", ["@This 0", "+", 1]], [false, true]]
        ]
        startTileSpawns = [[[0, 1], 80], [[0, 2], 8], [[0, 3], 6], [[0, 4], 4], [[1, 1], 2]];
        winConditions = [[5, 1]];
        winRequirement = 1;
        mode_vars = [true] // Are merges between a power of five and triple that power of five allowed?
        document.documentElement.style.setProperty("background-image", "radial-gradient(#c3ff00 0%, #fff 150%)");
        document.documentElement.style.setProperty("--background-color", "#f6ffda");
        document.documentElement.style.setProperty("--grid-color", "#c1c7a7");
        document.documentElement.style.setProperty("--tile-color", "#e4ecc2");
        document.documentElement.style.setProperty("--text-color", "#505246");
        displayRules("rules_text", ["h2", "Powers of 5"], ["h1", "3125"], ["p","Merges occur between any two tiles that add to a power of five, double a power of five, triple a power of five, or quadruple a power of five. Get to the 3125 tile to win!"],
        ["p", "Spawning tiles: 1 (80%), 2 (8%), 3 (6%), 4 (4%), 5 (2%)"]);
        displayRules("gm_rules_text", ["h2", "Powers of 5"], ["h1", "3125"], ["p","Merges occur between any two tiles that add to a power of five, double a power of five, triple a power of five, or quadruple a power of five. Get to the 3125 tile to win!"],
        ["p", "Spawning tiles: 1 (80%), 2 (8%), 3 (6%), 4 (4%), 5 (2%)"]);
        document.getElementById("mode_vars_line").style.setProperty("display", "block");
        document.getElementById("3125_vars").style.setProperty("display", "flex");
    }
    else if (mode == 5) { // 1296
        width = 5; height = 5; min_dim = 3;
        TileNumAmount = 2;
        TileTypes = [[[0, 1], 1, "#ffffff", "#464d52"], [[0, 2], 2, "#ffc4c4", "#464d52"], [[0, 3], 3, "#fffec4", "#464d52"],
        [[1, 1], 6, "#c300ff", "#464d52"], [[1, 2], 12, "#8000ff", "#464d52"], [[1, 3], 18, "#f200ff", "#464d52"],
        [[2, 1], 36, "#00ff00", "#464d52"], [[2, 2], 72, "#99ff00", "#464d52"], [[2, 3], 108, "#00ff88", "#464d52"],
        [[3, 1], 216, "#ff9d00", "#464d52"], [[3, 2], 432, "#ff5100", "#464d52"], [[3, 3], 648, "#ffc800", "#464d52"],
        [[4, 1], 1296, "#00a6ff", "#464d52"], [[4, 2], 2592, "#00eaff", "#464d52"], [[4, 3], 3888, "#0033ff", "#464d52"],
        [[5, 1], 7776, "#ff00bf", "#464d52"], [[5, 2], 15552, "#ff00fb", "#464d52"], [[5, 3], 23328, "#ff0062", "#464d52"],
        [[6, 1], 46656, "#ffff00", "#464d52"], [[6, 2], 93312, "#ffd900", "#464d52"], [[6, 3], 139968, "#c3ff00", "#464d52"],
        [["@This 1", "=", 1], [6, "^", "@This 0"], ["@HSLA", [97, "*", "@This 0", "-", 553], 100, [0.9, "^", ["@This 0", "-", 7], "*", 40], 1], "#e2ebf1"],
        [["@This 1", "=", 2], [6, "^", "@This 0", "*", 2], ["@HSLA", [97, "*", "@This 0", "-", 583], 100, [0.9, "^", ["@This 0", "-", 7], "*", 40], 1], "#e2ebf1"],
        [["@This 1", "=", 3], [6, "^", "@This 0", "*", 3], ["@HSLA", [97, "*", "@This 0", "-", 523], 100, [0.9, "^", ["@This 0", "-", 7], "*", 40], 1], "#e2ebf1"]];
        MergeRules = [
            [3, [["@Next 1 0", "=", "@This 0"], "&&", ["@Next 1 1", "=", "@This 1"], "&&", ["@Next 2 0", "=", "@This 0"], "&&", ["@Next 2 1", "=", "@This 1"], "&&", ["@This 1", "=", 1]], true, [["@This 0", 3]], [6, "^", "@This 0", "*", 3], [false, true, true]],
            [3, [["@Next 1 0", "=", "@This 0"], "&&", ["@Next 1 1", "=", "@This 1"], "&&", ["@Next 2 0", "=", "@This 0"], "&&", ["@Next 2 1", "=", "@This 1"], "&&", ["@This 1", "=", 2]], true, [[["@This 0", "+", 1], 1]], [6, "^", "@This 0", "*", 6], [false, true, true]],
            [2, [["@NextNE -1 0", "!=", "@This 0"], "||", ["@NextNE -1 1", "!=", "@This 1"], "&&", ["@Next 1 0", "=", "@This 0"], "&&", ["@Next 1 1", "=", "@This 1"], "&&", ["@This 1", "=", 1]], true, [["@This 0", 2]], [6, "^", "@This 0", "*", 2], [false, true]],
            [2, [["@Next 1 0", "=", "@This 0"], "&&", ["@Next 1 1", "=", "@This 1"], "&&", ["@This 1", "=", 3]], true, [[["@This 0", "+", 1], 1]], [6, "^", "@This 0", "*", 6], [false, true]]
        ]
        startTileSpawns = [[[0, 1], 80], [[0, 2], 12], [[0, 3], 6], [[1, 1], 2]];
        winConditions = [[4, 1]];
        winRequirement = 1;
        document.documentElement.style.setProperty("background-image", "radial-gradient(#00a6ff 0%, #fff 150%)");
        document.documentElement.style.setProperty("--background-color", "#daedff");
        document.documentElement.style.setProperty("--grid-color", "#a7b6c7");
        document.documentElement.style.setProperty("--tile-color", "#c2d9ec");
        document.documentElement.style.setProperty("--text-color", "#464d52");
        displayRules("rules_text", ["h2", "Powers of 6"], ["h1", "1296"], ["p","Merges occur between two or three of the same tile: two-tile merges occur between tiles that are a power of six or triple a power of six, and three-tile merges occur between tiles that are a power of six or double a power of six. Get to the 1296 tile to win!"],
        ["p", "Spawning tiles: 1 (80%), 2 (12%), 3 (6%), 6 (2%)"]);
        displayRules("gm_rules_text", ["h2", "Powers of 6"], ["h1", "1296"], ["p","Merges occur between two or three of the same tile: two-tile merges occur between tiles that are a power of six or triple a power of six, and three-tile merges occur between tiles that are a power of six or double a power of six. Get to the 1296 tile to win!"],
        ["p", "Spawning tiles: 1 (80%), 2 (12%), 3 (6%), 6 (2%)"]);
    }
    else if (mode == 6) { // 2401
        width = 5; height = 5; min_dim = 3;
        TileNumAmount = 2;
        TileTypes = [[[0, 1], 1, "#d7d7d7", "#524b46"], [[0, 2], 2, "#afafaf", "#f1ebe7"], [[0, 3], 3, "#ffffff", "#6d6a67"], [[0, 4], 4, "#787878", "#f1ebe7"],
        [[1, 1], 7, "#00ff73", "#524b46"], [[1, 2], 14, "#00be55", "#f1ebe7"], [[1, 3], 21, "#78ffb5", "#6d6a67"], [[1, 4], 28, "#00893e", "#f1ebe7"],
        [[2, 1], 49, "#6fff00", "#524b46"], [[2, 2], 98, "#59ce00", "#f1ebe7"], [[2, 3], 149, "#a5ff60", "#6d6a67"], [[2, 4], 196, "#449c00", "#f1ebe7"],
        [[3, 1], 343, "#ffff00", "#524b46"], [[3, 2], 686, "#d2d200", "#f1ebe7"], [[3, 3], 1029, "#ffff7c", "#6d6a67"], [[3, 4], 1372, "#a0a000", "#f1ebe7"],
        [[4, 1], 2401, "#ff9d00", "#524b46"], [[4, 2], 4802, "#d58300", "#f1ebe7"], [[4, 3], 7203, "#ffc972", "#6d6a67"], [[4, 4], 9604, "#a26400", "#f1ebe7"],
        [[5, 1], 16807, "#ff2600", "#524b46"], [[5, 2], 33614, "#cb1e00", "#f1ebe7"], [[5, 3], 50421, "#ff6e54", "#6d6a67"], [[5, 4], 67228, "#901600", "#f1ebe7"],
        [[6, 1], 117649, "#fc01df", "#524b46"], [[6, 2], 235298, "#cb00b4", "#f1ebe7"], [[6, 3], 352947, "#ff6eee", "#6d6a67"], [[6, 4], 470596, "#9a0088", "#f1ebe7"],
        [[7, 1], 823543, "#6f00ff", "#524b46"], [[7, 2], 1647086, "#5100bb", "#f1ebe7"], [[7, 3], 2470629, "#ac6dff", "#6d6a67"], [[7, 4], 3294172, "#340078", "#f1ebe7"],
        [[8, 1], 5764801, "#0066ff", "#524b46"], [[8, 2], 11529602, "#0050c9", "#f1ebe7"], [[8, 3], 17294403, "#5e9eff", "#6d6a67"], [[8, 4], 23059204, "#003c95", "#f1ebe7"],
        [[9, 1], 40353607, "#00eaff", "#524b46"], [[9, 2], 80707214, "#00c6d7", "#f1ebe7"], [[9, 3], 121060821, "#6df3ff", "#6d6a67"], [[9, 4], 161414428, "#0097a5", "#f1ebe7"],
        [["@This 1", "=", 1], [7, "^", "@This 0"], ["@HSLA", [-37, "*", "@This 0", "-", 210], [0.95, "^", ["@This 0", "-", 10], "*", 75], 50, 1], "#524b46"],
        [["@This 1", "=", 2], [7, "^", "@This 0", "*", 2], ["@HSLA", [-37, "*", "@This 0", "-", 210], [0.95, "^", ["@This 0", "-", 10], "*", 75], 37.5, 1], "#f1ebe7"],
        [["@This 1", "=", 3], [7, "^", "@This 0", "*", 3], ["@HSLA", [-37, "*", "@This 0", "-", 210], [0.95, "^", ["@This 0", "-", 10], "*", 75], 70, 1], "#6d6a67"],
        [["@This 1", "=", 4], [7, "^", "@This 0", "*", 4], ["@HSLA", [-37, "*", "@This 0", "-", 210], [0.95, "^", ["@This 0", "-", 10], "*", 75], 25, 1], "#f1ebe7"]];
        MergeRules = [
            [3, [["@Next 1 0", "=", "@This 0"], "&&", ["@Next 1 1", "=", "@This 1"], "&&", ["@Next 2 0", "=", "@This 0"], "&&", ["@Next 2 1", "=", "@This 1"], "&&", ["@This 1", "=", 1]], true, [["@This 0", 3]], [7, "^", "@This 0", "*", 3], [false, true, true]],
            [2, [["@NextNE -1 0", "!=", "@This 0"], "||", ["@NextNE -1 1", "!=", "@This 1"], "&&", ["@Next 1 0", "=", "@This 0"], "&&", ["@Next 1 1", "=", "@This 1"], "&&", ["@This 1", "=", 1]], true, [["@This 0", 2]], [7, "^", "@This 0", "*", 2], [false, true]],
            [2, [["@Next 1 0", "=", "@This 0"], "&&", ["@Next 1 1", "=", "@This 1"], "&&", ["@This 1", "=", 2]], true, [["@This 0", 4]], [7, "^", "@This 0", "*", 4], [false, true]],
            [2, [["@Next 1 0", "=", "@This 0"], "&&", ["@Next 1 1", "=", 3], "&&", ["@This 1", "=", 4]], false, [[["@This 0", "+", 1], 1]], [7, "^", "@This 0", "*", 7], [false, true]]
        ]
        startTileSpawns = [[[0, 1], 80], [[0, 2], 10], [[0, 3], 5], [[0, 4], 5]];
        winConditions = [[4, 1]];
        winRequirement = 1;
        document.documentElement.style.setProperty("background-image", "radial-gradient(#ff9d00 0%, #fff 150%)");
        document.documentElement.style.setProperty("--background-color", "#ffedda");
        document.documentElement.style.setProperty("--grid-color", "#c7b6a7");
        document.documentElement.style.setProperty("--tile-color", "#ecd8c2");
        document.documentElement.style.setProperty("--text-color", "#524b46");
        displayRules("rules_text", ["h2", "Powers of 7"], ["h1", "2401"], ["p","Merges occur between two or three tiles that are the same power of seven, two tiles that are double the same power of seven, or one tile that is triple a power of seven and one tile that is quadruple that power of seven. Get to the 2401 tile to win!"],
        ["p", "Spawning tiles: 1 (80%), 2 (10%), 3 (5%), 4 (5%)"]);
        displayRules("gm_rules_text", ["h2", "Powers of 7"], ["h1", "2401"], ["p","Merges occur between two or three tiles that are the same power of seven, two tiles that are double the same power of seven, or one tile that is triple a power of seven and one tile that is quadruple that power of seven. Get to the 2401 tile to win!"],
        ["p", "Spawning tiles: 1 (80%), 2 (10%), 3 (5%), 4 (5%)"]);
    }
    else if (mode == 7) { // 4096
        width = 4; height = 4; min_dim = 2;
        TileNumAmount = 2;
        TileTypes = [[[0, 1], 1, "#ffffff", "#484652"], [[0, 2], 2, "#c6c6c6", "#484652"], [[0, 3], 3, "#898989", "#e8e6f3"], [[0, 5], 5, "#5f5f5f", "#e8e6f3"],
        [[1, 1], 8, "#ff4646", "#484652"], [[1, 2], 16, "#ff0a0a", "#484652"], [[1, 3], 24, "#c50000", "#e8e6f3"], [[1, 5], 40, "#860000", "#e8e6f3"],
        [[2, 1], 64, "#ff66ed", "#484652"], [[2, 2], 128, "#ff00e1", "#484652"], [[2, 3], 192, "#c100aa", "#e8e6f3"], [[2, 5], 320, "#7b006d", "#e8e6f3"],
        [[3, 1], 512, "#d562ff", "#484652"], [[3, 2], 1024, "#bb00ff", "#484652"], [[3, 3], 1536, "#8800ba", "#e8e6f3"], [[3, 5], 2560, "#580078", "#e8e6f3"],
        [[4, 1], 4096, "#6b5aff", "#484652"], [[4, 2], 8192, "#1900ff", "#484652"], [[4, 3], 12288, "#1300be", "#e8e6f3"], [[4, 5], 20480, "#0c007a", "#e8e6f3"],
        [[5, 1], 32768, "#6dccff", "#484652"], [[5, 2], 65536, "#00a6ff", "#484652"], [[5, 3], 98304, "#0081c7", "#e8e6f3"], [[5, 5], 163840, "#006094", "#e8e6f3"],
        [[6, 1], 262144, "#75ffcf", "#484652"], [[6, 2], 524288, "#00ffa6", "#484652"], [[6, 3], 786432, "#00d289", "#e8e6f3"], [[6, 5], 1310720, "#00a26a", "#e8e6f3"],
        [["@This 1", "=", 1], [8, "^", "@This 0"], ["@HSLA", [-34.5, "*", "@This 0", "+", 331.5], [0.95, "^", ["@This 0", "-", 7], "*", 100], 65, 1], "#484652"],
        [["@This 1", "=", 2], [8, "^", "@This 0", "*", 2], ["@HSLA", [-34.5, "*", "@This 0", "+", 331.5], [0.9, "^", ["@This 0", "-", 7], "*", 100], 50, 1], "#484652"],
        [["@This 1", "=", 3], [8, "^", "@This 0", "*", 3], ["@HSLA", [-34.5, "*", "@This 0", "+", 331.5], [0.9, "^", ["@This 0", "-", 7], "*", 100], 37.5, 1], "#e8e6f3"],
        [["@This 1", "=", 5], [8, "^", "@This 0", "*", 5], ["@HSLA", [-34.5, "*", "@This 0", "+", 331.5], [0.9, "^", ["@This 0", "-", 7], "*", 100], 25, 1], "#e8e6f3"]]
        MergeRules = [
            [2, [["@Next 1 0", "=", "@This 0"], "&&", ["@Next 1 1", "=", 1], "&&", ["@This 1", "=", 1]], false, [["@This 0", 2]], [8, "^", "@This 0", "*", 2], [false, true]],
            [2, [["@Next 1 0", "=", "@This 0"], "&&", ["@Next 1 1", "=", 2], "&&", ["@This 1", "=", 1]], false, [["@This 0", 3]], [8, "^", "@This 0", "*", 3], [false, true]],
            [2, [["@Next 1 0", "=", "@This 0"], "&&", ["@Next 1 1", "=", 3], "&&", ["@This 1", "=", 2]], false, [["@This 0", 5]], [8, "^", "@This 0", "*", 5], [false, true]],
            [2, [["@Next 1 0", "=", "@This 0"], "&&", ["@Next 1 1", "=", 5], "&&", ["@This 1", "=", 3]], false, [[["@This 0", "+", 1], 1]], [8, "^", "@This 0", "*", 8], [false, true]],
        ]
        startTileSpawns = [[[0, 1], 85], [[0, 2], 8], [[0, 3], 5], [[0, 5], 2]];
        winConditions = [[4, 1]];
        winRequirement = 1;
        document.documentElement.style.setProperty("background-image", "radial-gradient(#1900ff 0%, #fff 150%)");
        document.documentElement.style.setProperty("--background-color", "#dedaff");
        document.documentElement.style.setProperty("--grid-color", "#a8a7c7");
        document.documentElement.style.setProperty("--tile-color", "#c5c2ec");
        document.documentElement.style.setProperty("--text-color", "#484652");
        displayRules("rules_text", ["h2", "Powers of 8"], ["h1", "4096"], ["p","Merges occur between two equal tiles that are a power of eight, between a tile that's a power of eight and a tile that's double that power of eight, between a tile that's double a power of eight and a tile that's triple that power of eight, and between a tile that's triple a power of eight and a tile that's quintuple that power of eight. Get to the 4096 tile to win!"],
        ["p", "Spawning tiles: 1 (85%), 2 (8%), 3 (5%), 5 (2%)"]);
        displayRules("gm_rules_text", ["h2", "Powers of 8"], ["h1", "4096"], ["p","Merges occur between two equal tiles that are a power of eight, between a tile that's a power of eight and a tile that's double that power of eight, between a tile that's double a power of eight and a tile that's triple that power of eight, and between a tile that's triple a power of eight and a tile that's quintuple that power of eight. Get to the 4096 tile to win!"],
        ["p", "Spawning tiles: 1 (85%), 2 (8%), 3 (5%), 5 (2%)"]);
    }
    else if (mode == 8) { // 6561
        width = 6; height = 6; min_dim = 4;
        TileNumAmount = 2;
        TileTypes = [[[0, 1], 1, "#ffffff", "#465252"], [[0, 4], 4, "#828282", "#e2e9e9"], [[1, 1], 9, "#ff52b1", "#465252"], [[1, 4], 36, "#c2006b", "#e2e9e9"],
        [[2, 1], 81, "#df53ff", "#465252"], [[2, 4], 324, "#9000b0", "#e2e9e9"], [[3, 1], 729, "#6e4aff", "#465252"], [[3, 4], 2916, "#2500b7", "#e2e9e9"],
        [[4, 1], 6561, "#44f6ff", "#465252"], [[4, 4], 26244, "#00afb8", "#e2e9e9"], [[5, 1], 59049, "#6eff69", "#465252"], [[5, 4], 236196, "#06ba00", "#e2e9e9"],
        [[6, 1], 531441, "#ffff62", "#465252"], [[6, 4], 2125764, "#caca00", "#e2e9e9"], [[7, 1], 4782969, "#ffb151", "#465252"], [[7, 4], 19131876, "#d67600", "#e2e9e9"],
        [[8, 1], 43046721, "#ff6969", "#465252"], [[8, 4], 172186884, "#ac0000", "#e2e9e9"],
        [["@This 1", "=", 1], [9, "^", "@This 0"], ["@HSLA", [-48.5, "*", "@This 0", "+", 736.5], [0.9, "^", ["@This 0", "-", 9], "*", 85], 70, 1], "#465252"],
        [["@This 1", "=", 4], [9, "^", "@This 0", "*", 4], ["@HSLA", [-48.5, "*", "@This 0", "+", 736.5], [0.9, "^", ["@This 0", "-", 9], "*", 85], 30, 1], "#e2e9e9"],]
        MergeRules = [
            [4, [["@Next 1 0", "=", "@This 0"], "&&", ["@Next 1 1", "=", "@This 1"], "&&", ["@Next 2 0", "=", "@This 0"], "&&", ["@Next 2 1", "=", "@This 1"], "&&", ["@Next 3 0", "=", "@This 0"], "&&", ["@Next 3 1", "=", "@This 1"],"&&", ["@This 1", "=", 1]], true, [["@This 0", 4]], [9, "^", "@This 0", "*", 4], [false, true, true, true]],
            [3, [["@Next 1 0", "=", "@This 0"], "&&", ["@Next 2 0", "=", "@This 0"], "&&", ["@This 1", "=", 1], "&&", ["@Next 1 1", "=", 4], "&&", ["@Next 2 1", "=", 4]], false, [[["@This 0", "+", 1], 1]], [9, "^", "@This 0", "*", 9], [false, true, true]],
        ]
        startTileSpawns = [[[0, 1], 95], [[0, 4], 5]];
        winConditions = [[4, 1]];
        winRequirement = 1;
        document.documentElement.style.setProperty("background-image", "radial-gradient(#00f2ff 0%, #fff 150%)");
        document.documentElement.style.setProperty("--background-color", "#dafffe");
        document.documentElement.style.setProperty("--grid-color", "#a7c4c7");
        document.documentElement.style.setProperty("--tile-color", "#c2eaec");
        document.documentElement.style.setProperty("--text-color", "#465252");
        displayRules("rules_text", ["h2", "Powers of 9"], ["h1", "6561"], ["p","Merges occur between four equal tiles that are a power of nine, and between a tile that's a power of nine and two tiles that are quadruple that power of nine. Get to the 6561 tile to win!"],
        ["p", "Spawning tiles: 1 (95%), 4 (5%)"]);
        displayRules("gm_rules_text", ["h2", "Powers of 9"], ["h1", "6561"], ["p","Merges occur between four equal tiles that are a power of nine, and between a tile that's a power of nine and two tiles that are quadruple that power of nine. Get to the 6561 tile to win!"],
        ["p", "Spawning tiles: 1 (95%), 4 (5%)"]);
    }
    else if (mode == 9) { // 1000
        width = 5; height = 5; min_dim = 3;
        TileNumAmount = 2;
        TileTypes = [[[0, 1], 1, "#ffffff", "#524946"], [[0, 2], 2, "#cacaca", "#524946"], [[0, 5], 5, "#7e7e7e", "#524946"],
        [[1, 1], 10, "#94cbff", "#524946"], [[1, 2], 20, "#54acff", "#524946"], [[1, 5], 50, "#0084ff", "#524946"],
        [[2, 1], 100, "#f1ffb8", "#524946"], [[2, 2], 200, "#e6ff82", "#524946"], [[2, 5], 500, "#ccff00", "#524946"],
        [[3, 1], 1000, "#ffa981", "#524946"], [[3, 2], 2000, "#ff834a", "#524946"], [[3, 5], 5000, "#ff5100", "#524946"],
        [[4, 1], 10000, "#faa4ff", "#524946"], [[4, 2], 20000, "#f765ff", "#524946"], [[4, 5], 50000, "#f200ff", "#524946"],
        [[5, 1], 100000, "#b184ff", "#524946"], [[5, 2], 200000, "#9355ff", "#524946"], [[5, 5], 500000, "#5d00ff", "#524946"],
        [[6, 1], 1000000, "#b0ffeb", "#524946"], [[6, 2], 2000000, "#65ffd9", "#524946"], [[6, 5], 5000000, "#00ffbf", "#524946"],
        [[7, 1], 10000000, "#fff49f", "#524946"], [[7, 2], 20000000, "#ffec5e", "#524946"], [[7, 5], 50000000, "#ffe100", "#524946"],
        [["@This 1", "=", 1], [10, "^", "@This 0"], ["@HSVA", [-83, "*", "@This 0", "+", 1000], 33, [0.9, "^", ["@This 0", "-", 8], "*", 100], 1], "#efe6e3"],
        [["@This 1", "=", 2], [10, "^", "@This 0", "*", 2], ["@HSVA", [-83, "*", "@This 0", "+", 1000], 66, [0.9, "^", ["@This 0", "-", 8], "*", 100], 1], "#efe6e3"],
        [["@This 1", "=", 3], [10, "^", "@This 0", "*", 5], ["@HSVA", [-83, "*", "@This 0", "+", 1000], 100, [0.9, "^", ["@This 0", "-", 8], "*", 100], 1], "#efe6e3"],
        ]
        MergeRules = [
            [2, [["@Next 1 0", "=", "@This 0"], "&&", ["@Next 1 1", "=", 1], "&&", ["@This 1", "=", 1]], false, [["@This 0", 2]], [10, "^", "@This 0", "*", 2], [false, true]],
            [3, [["@Next 1 0", "=", "@This 0"], "&&", ["@Next 2 0", "=", "@This 0"], "&&", ["@This 1", "=", 1], "&&", ["@Next 1 1", "=", 2], "&&", ["@Next 2 1", "=", 2]], false, [["@This 0", 5]], [10, "^", "@This 0", "*", 5], [false, true, true]],
            [2, [["@Next 1 0", "=", "@This 0"], "&&", ["@Next 1 1", "=", 5], "&&", ["@This 1", "=", 5]], false, [[["@This 0", "+", 1], 1]], [10, "^", "@This 0", "*", 10], [false, true]],
        ]
        startTileSpawns = [[[0, 1], 85], [[0, 2], 12], [[0, 5], 3]];
        winConditions = [[3, 1]];
        winRequirement = 1;
        document.documentElement.style.setProperty("background-image", "radial-gradient(#ff5100 0%, #fff 150%)");
        document.documentElement.style.setProperty("--background-color", "#ffe1da");
        document.documentElement.style.setProperty("--grid-color", "#c7b0a7");
        document.documentElement.style.setProperty("--tile-color", "#ecccc2");
        document.documentElement.style.setProperty("--text-color", "#524946");
        displayRules("rules_text", ["h2", "Powers of 10"], ["h1", "1000"], ["p","Merges occur between two equal tiles that are either a power of ten or quintuple a power of ten, or between one tile that is a power of ten and two tiles that are double that same power of 10. Get to the 1000 tile to win!"],
        ["p", "Spawning tiles: 1 (85%), 2 (12%), 5 (3%)"]);
        displayRules("gm_rules_text", ["h2", "Powers of 10"], ["h1", "1000"], ["p","Merges occur between two equal tiles that are either a power of ten or quintuple a power of ten, or between one tile that is a power of ten and two tiles that are double that same power of 10. Get to the 1000 tile to win!"],
        ["p", "Spawning tiles: 1 (85%), 2 (12%), 5 (3%)"]);
    }
    else if (mode == 10) { // 1331
        width = 5; height = 5; min_dim = 3;
        TileNumAmount = 2;
        TileTypes = [[[0, 1], 1, "#ffffff", "#485246"], [[0, 2], 2, "#c6c6c6", "#485246"], [[0, 3], 3, "#898989", "#e1edde"], [[0, 6], 6, "#5f5f5f", "#e1edde"],
        [[1, 1], 11, "#ff5454", "#485246"], [[1, 2], 22, "#ff0000", "#485246"], [[1, 3], 33, "#cb0000", "#e1edde"], [[1, 6], 66, "#950000", "#e1edde"],
        [[2, 1], 121, "#fee975", "#485246"], [[2, 2], 242, "#ffd900", "#485246"], [[2, 3], 363, "#c6a800", "#e1edde"], [[2, 6], 726, "#826e00", "#e1edde"],
        [[3, 1], 1331, "#92ff92", "#485246"], [[3, 2], 2662, "#00ff00", "#485246"], [[3, 3], 3993, "#00b800", "#e1edde"], [[3, 6], 7986, "#006c00", "#e1edde"],
        [[4, 1], 14641, "#81dfff", "#485246"], [[4, 2], 29282, "#00bfff", "#485246"], [[4, 3], 43923, "#028bb8", "#e1edde"], [[4, 6], 87846, "#005673", "#e1edde"],
        [[5, 1], 161051, "#b367ff", "#485246"], [[5, 2], 322102, "#8000ff", "#485246"], [[5, 3], 483153, "#5900b1", "#e1edde"], [[5, 6], 966306, "#37006f", "#e1edde"],
        [[6, 1], 1771561, "#ff6fe5", "#485246"], [[6, 2], 3543122, "#ff00d0", "#485246"], [[6, 3], 5314683, "#c2009e", "#e1edde"], [[6, 6], 10629366, "#83016b", "#e1edde"],
        [["@This 1", "=", 1], [11, "^", "@This 0"], ["@HSLA", [67, "*", "@This 0", "-", 439], [0.9, "^", ["@This 0", "-", 7], "*", 100], 70, 1], "#485246"],
        [["@This 1", "=", 2], [11, "^", "@This 0", "*", 2], ["@HSLA", [67, "*", "@This 0", "-", 439], [0.9, "^", ["@This 0", "-", 7], "*", 100], 50, 1], "#485246"],
        [["@This 1", "=", 3], [11, "^", "@This 0", "*", 3], ["@HSLA", [67, "*", "@This 0", "-", 439], [0.9, "^", ["@This 0", "-", 7], "*", 100], 37.5, 1], "#e1edde"],
        [["@This 1", "=", 6], [11, "^", "@This 0", "*", 6], ["@HSLA", [67, "*", "@This 0", "-", 439], [0.9, "^", ["@This 0", "-", 7], "*", 100], 25, 1], "#e1edde"],
        ]
        MergeRules = [
            [3, [["@Next 1 0", "=", "@This 0"], "&&", ["@Next 2 0", "=", "@This 0"], "&&", ["@Next 2 1", "=", 3], "&&", ["@Next 1 1", "=", 2], "&&", ["@This 1", "=", 1]], false, [["@This 0", 6]], [11, "^", "@This 0", "*", 6], [false, true, true]],
            [3, [["@Next 1 0", "=", "@This 0"], "&&", ["@Next 2 0", "=", "@This 0"], "&&", ["@Next 2 1", "=", 6], "&&", ["@Next 1 1", "=", 3], "&&", ["@This 1", "=", 2]], false, [[["@This 0", "+", 1], 1]], [11, "^", "@This 0", "*", 11], [false, true, true]],
            [2, [["@Next 1 0", "=", "@This 0"], "&&", ["@Next 1 1", "=", 1], "&&", ["@This 1", "=", 1]], false, [["@This 0", 2]], [11, "^", "@This 0", "*", 2], [false, true]],
            [2, [["@Next 1 0", "=", "@This 0"], "&&", ["@Next 1 1", "=", 2], "&&", ["@This 1", "=", 1], "&&", [["@NextNE -1 0", "!=", "@This 0"], "||", ["@NextNE -1 1", "!=", 3]]], false, [["@This 0", 3]], [11, "^", "@This 0", "*", 3], [false, true]]
        ]
        startTileSpawns = [[[0, 1], 80], [[0, 2], 12], [[0, 3], 6], [[0, 6], 2]];
        winConditions = [[3, 1]];
        winRequirement = 1;
        document.documentElement.style.setProperty("background-image", "radial-gradient(#00ff00 0%, #fff 150%)");
        document.documentElement.style.setProperty("--background-color", "#e1ffda");
        document.documentElement.style.setProperty("--grid-color", "#a8c7a7");
        document.documentElement.style.setProperty("--tile-color", "#caecc2");
        document.documentElement.style.setProperty("--text-color", "#485246");
        displayRules("rules_text", ["h2", "Powers of 11"], ["h1", "1331"], ["p","  Merges can occur between two tiles that are both the same number and a power of eleven, between a power of eleven and a tile that's double it, between a tile that's a power of eleven, a tile that's double the same power of eleven, and a tile that's triple the same power of eleven, or between a tile that's double a power of eleven, a tile that's triple the same power of eleven, and a tile that's six times the same power of eleven. Get to the 1331 tile to win!"],
        ["p", "Spawning tiles: 1 (80%), 2 (12%), 3 (6%), 6 (2%)"]);
        displayRules("gm_rules_text", ["h2", "Powers of 11"], ["h1", "1331"], ["p","  Merges can occur between two tiles that are both the same number and a power of eleven, between a power of eleven and a tile that's double it, between a tile that's a power of eleven, a tile that's double the same power of eleven, and a tile that's triple the same power of eleven, or between a tile that's double a power of eleven, a tile that's triple the same power of eleven, and a tile that's six times the same power of eleven. Get to the 1331 tile to win!"],
        ["p", "Spawning tiles: 1 (80%), 2 (12%), 3 (6%), 6 (2%)"]);
    }
    else if (mode == 11) { // 1728
        width = 5; height = 5; min_dim = 3;
        TileNumAmount = 2;
        TileTypes = [[[0, 1], 1, "#aaff00", "#584e59"], [[0, 2], 2, "#84c503", "#f4edf6"], [[0, 3], 3, "#dbff93", "#2d292e"],
        [[0, 4], 4, "#5c8a00", "#f4edf6"], [[0, 6], 6, "#a9e03c", "#584e59"],
        [[1, 1], 12, "#ff9500", "#584e59"], [[1, 2], 24, "#c97500", "#f4edf6"], [[1, 3], 36, "#ffbc5e", "#2d292e"],
        [[1, 4], 48, "#874f00", "#f4edf6"], [[1, 6], 72, "#d6902e", "#584e59"],
        [[2, 1], 144, "#ff007b", "#584e59"], [[2, 2], 288, "#be005c", "#f4edf6"], [[2, 3], 432, "#ff61ad", "#2d292e"],
        [[2, 4], 576, "#7a003b", "#f4edf6"], [[2, 6], 864, "#cd337e", "#584e59"],
        [[3, 1], 1728, "#d000ff", "#584e59"], [[3, 2], 3456, "#9a00bc", "#f4edf6"], [[3, 3], 5184, "#e261ff", "#2d292e"],
        [[3, 4], 6912, "#610077", "#f4edf6"], [[3, 6], 10368, "#ac27ca", "#584e59"],
        [[4, 1], 20736, "#006aff", "#584e59"], [[4, 2], 41472, "#004fbc", "#f4edf6"], [[4, 3], 62208, "#60a2ff", "#2d292e"],
        [[4, 4], 82944, "#003073", "#f4edf6"], [[4, 6], 124416, "#296ac6", "#584e59"],
        [[5, 1], 248832, "#00ff73", "#584e59"], [[5, 2], 497664, "#00bf56", "#f4edf6"], [[5, 3], 746496, "#70ffb0", "#2d292e"],
        [[5, 4], 995328, "#007f39", "#f4edf6"], [[5, 6], 1492992, "#26be6a", "#584e59"],
        [["@This 1", "=", 1], [12, "^", "@This 0"], ["@HSLA", [-74, "*", "@This 0", "+", 495], [0.95, "^", ["@This 0", "-", 6], "*", 100], 50, 1], "#584e59"],
        [["@This 1", "=", 2], [12, "^", "@This 0", "*", 2], ["@HSLA", [-74, "*", "@This 0", "+", 495], [0.95, "^", ["@This 0", "-", 6], "*", 100], 37.5, 1], "#f4edf6"],
        [["@This 1", "=", 3], [12, "^", "@This 0", "*", 3], ["@HSLA", [-74, "*", "@This 0", "+", 495], [0.95, "^", ["@This 0", "-", 6], "*", 100], 70, 1], "#2d292e"],
        [["@This 1", "=", 4], [12, "^", "@This 0", "*", 4], ["@HSLA", [-74, "*", "@This 0", "+", 495], [0.95, "^", ["@This 0", "-", 6], "*", 100], 25, 1], "#f4edf6"],
        [["@This 1", "=", 6], [12, "^", "@This 0", "*", 6], ["@HSLA", [-74, "*", "@This 0", "+", 495], [0.95, "^", ["@This 0", "-", 6], "*", 75], 50, 1], "#584e59"],
        ];
        MergeRules = [
            [4, [["@Next 1 0", "=", "@This 0"], "&&", ["@Next 1 1", "=", "@This 1"], "&&", ["@Next 2 0", "=", "@This 0"], "&&", ["@Next 2 1", "=", "@This 1"], "&&", ["@Next 3 0", "=", "@This 0"], "&&", ["@Next 3 1", "=", "@This 1"], "&&", ["@This 1", "=", 1]], true, [["@This 0", 4]], [12, "^", "@This 0", "*", 4], [false, true, true, true]],
            [4, [["@Next 1 0", "=", "@This 0"], "&&", ["@Next 1 1", "=", "@This 1"], "&&", ["@Next 2 0", "=", "@This 0"], "&&", ["@Next 2 1", "=", "@This 1"], "&&", ["@Next 3 0", "=", "@This 0"], "&&", ["@Next 3 1", "=", "@This 1"], "&&", ["@This 1", "=", 3]], true, [[["@This 0", "+", 1], 1]], [12, "^", "@This 0", "*", 12], [false, true, true, true]],
            [3, [["@NextNE -1 0", "!=", "@This 0"], "||", ["@NextNE -1 1", "!=", "@This 1"], "&&", ["@Next 1 0", "=", "@This 0"], "&&", ["@Next 1 1", "=", "@This 1"], "&&", ["@Next 2 0", "=", "@This 0"], "&&", ["@Next 2 1", "=", "@This 1"], "&&", ["@This 1", "=", 1]], true, [["@This 0", 3]], [12, "^", "@This 0", "*", 3], [false, true, true]],
            [3, [["@Next 1 0", "=", "@This 0"], "&&", ["@Next 1 1", "=", "@This 1"], "&&", ["@Next 2 0", "=", "@This 0"], "&&", ["@Next 2 1", "=", "@This 1"], "&&", ["@This 1", "=", 2]], true, [["@This 0", 6]], [12, "^", "@This 0", "*", 6], [false, true, true]],
            [3, [["@Next 1 0", "=", "@This 0"], "&&", ["@Next 1 1", "=", "@This 1"], "&&", ["@Next 2 0", "=", "@This 0"], "&&", ["@Next 2 1", "=", "@This 1"], "&&", ["@This 1", "=", 4]], true, [[["@This 0", "+", 1], 1]], [12, "^", "@This 0", "*", 12], [false, true, true]],
            [2, [["@NextNE -1 0", "!=", "@This 0"], "||", ["@NextNE -1 1", "!=", "@This 1"], "&&", ["@Next 1 0", "=", "@This 0"], "&&", ["@Next 1 1", "=", "@This 1"], "&&", ["@This 1", "=", 1]], true, [["@This 0", 2]], [12, "^", "@This 0", "*", 2], [false, true]],
            [2, [["@NextNE -1 0", "!=", "@This 0"], "||", ["@NextNE -1 1", "!=", "@This 1"], "&&", ["@Next 1 0", "=", "@This 0"], "&&", ["@Next 1 1", "=", "@This 1"], "&&", ["@This 1", "=", 2]], true, [["@This 0", 4]], [12, "^", "@This 0", "*", 4], [false, true]],
            [2, [[["@Next -2 0", "!=", "@This 0"], "||", ["@Next -2 1", "!=", "@This 1"]], "&&", [["@Next 2 0", "!=", "@This 0"], "||", ["@Next 2 1", "!=", "@This 1"]], "||", ["@NextNE -1 0", "!=", "@This 0"], "||", ["@NextNE -1 1", "!=", "@This 1"], "&&", ["@Next 1 0", "=", "@This 0"], "&&", ["@Next 1 1", "=", "@This 1"], "&&", ["@This 1", "=", 3]], true, [["@This 0", 6]], [12, "^", "@This 0", "*", 6], [false, true]],
            [2, [["@Next 1 0", "=", "@This 0"], "&&", ["@Next 1 1", "=", "@This 1"], "&&", ["@This 1", "=", 6]], true, [[["@This 0", "+", 1], 1]], [12, "^", "@This 0", "*", 12], [false, true]],
        ]
        startTileSpawns = [[[0, 1], 80], [[0, 2], 10], [[0, 3], 5], [[0, 4], 5]];
        winConditions = [[3, 1]];
        winRequirement = 1;
        document.documentElement.style.setProperty("background-image", "radial-gradient(#d000ff 0%, #fff 150%)");
        document.documentElement.style.setProperty("--background-color", "#fbdaff");
        document.documentElement.style.setProperty("--grid-color", "#c2a7c7");
        document.documentElement.style.setProperty("--tile-color", "#e6c2ec");
        document.documentElement.style.setProperty("--text-color", "#514652");
        displayRules("rules_text", ["h2", "Powers of 12"], ["h1", "1728"], ["p","Merges occur between two, three, or four of the same tile, as long as those tiles add up to a power of twelve or double, triple, quadruple, or sextuple a power of twelve, except a merge cannot occur between four tiles that are sextuple a power of twelve. Get to the 1728 tile to win!"],
        ["p", "Spawning tiles: 1 (80%), 2 (10%), 3 (5%), 4 (5%)"]);
        displayRules("gm_rules_text", ["h2", "Powers of 12"], ["h1", "1728"], ["p","Merges occur between two, three, or four of the same tile, as long as those tiles add up to a power of twelve or double, triple, quadruple, or sextuple a power of twelve, except a merge cannot occur between four tiles that are sextuple a power of twelve. Get to the 1728 tile to win!"],
        ["p", "Spawning tiles: 1 (80%), 2 (10%), 3 (5%), 4 (5%)"]);
    }
    else if (mode == 12) { // 2047
        width = 5; height = 5; min_dim = 3;
        TileNumAmount = 1;
        TileTypes = [[[1], 1, "#ffffff", "#746577"], [[2], 3, "#d8ffb6", "#746577"], [[3], 7, "#a7ff5a", "#746577"],
        [[4], 15, "#77ff00", "#746577"], [[5], 31, "#00ff33", "#746577"], [[6], 63, "#00ff9d", "#746577"], [[7], 127, "#00ffd9", "#746577"],
        [[8], 255, "#dba6ff", "#f5eff7"], [[9], 511, "#c671ff", "#f5eff7"], [[10], 1023, "#b23eff", "#f5eff7"], [[11], 2047, "#9900ff", "#f5eff7"],
        [[12], 4095, "#ff9ed0", "#f5eff7"], [[13], 8191, "#ff62b3", "#f5eff7"], [[14], 16383, "#ff2b99", "#f5eff7"], [[15], 32767, "#e90079", "#f5eff7"],
        [[16], 65535, "#9d0051", "#f5eff7"], [[17], 131071, "#ff7b4f", "#f5eff7"], [[18], 262143, "#ff4000", "#f5eff7"], [[19], 524287, "#bf3000", "#f5eff7"],
        [true, [2, "^", "@This 0", "-", 1], ["@HSLA", [15, "*", "@This 0", "-", 265], 100, [0.9, "^", ["@This 0", "-", 20], "*", 36], 1], "#f5eff7"]];
        MergeRules = [[3, [["@Next 1 0", "=", "@This 0"], "&&", ["@Next 2 0", "=", 1], "&&", ["@This 0", "typeof", "=", "number"]], false, [[["@This 0", "+", 1]]], [2, "^", ["@This 0", "+", 1], "-", 1], [false, true, true]]];
        startTileSpawns = [[[1], 95], [[2], 5]];
        winConditions = [[11]];
        winRequirement = 1;
        document.documentElement.style.setProperty("background-image", "radial-gradient(#9900ff 0%, #fff 150%)");
        document.documentElement.style.setProperty("--background-color", "#f1daff");
        document.documentElement.style.setProperty("--grid-color", "#bca7c7");
        document.documentElement.style.setProperty("--tile-color", "#dac2ec");
        document.documentElement.style.setProperty("--text-color", "#4e4652");
        displayRules("rules_text", ["h2", "Powers of 2 Minus 1"], ["h1", "2047"], ["p", "Merges occur between three tiles. Two of them must be equal to each other, and the third must be a 1. Get to the 2047 tile to win!"],
        ["p", "Spawning tiles: 1 (95%), 3 (5%)"]);
        displayRules("gm_rules_text", ["h2", "Powers of 2 Minus 1"], ["h1", "2047"], ["p", "Merges occur between three tiles. Two of them must be equal to each other, and the third must be a 1. Get to the 2047 tile to win!"],
        ["p", "Spawning tiles: 1 (95%), 3 (5%)"]);
    }
    else if (mode == 13) { // 2186
        width = 5; height = 5; min_dim = 3;
        TileNumAmount = 2;
        TileTypes = [[[0, 1], 1, "#ffffff", "#46524c"], [[1, 1], 2, "#a2a2ff", "#46524c"], [[1, 2], 5, "#0000e6", "#ebf6f1"],
        [[2, 1], 8, "#81ffff", "#46524c"], [[2, 2], 17, "#00ffff", "#ebf6f1"], [[3, 1], 26, "#6fb5ff", "#46524c"], [[3, 2], 53, "#007bff", "#ebf6f1"],
        [[4, 1], 80, "#f4ff62", "#46524c"], [[4, 2], 161, "#d5e400", "#ebf6f1"], [[5, 1], 242, "#d269ff", "#46524c"], [[5, 2], 485, "#9b00dd", "#ebf6f1"],
        [[6, 1], 728, "#9aff7b", "#46524c"], [[6, 2], 1457, "#3bfa00", "#ebf6f1"], [[7, 1], 2186, "#5affb5", "#46524c"], [[7, 2], 4373, "#00ff8c", "#ebf6f1"],
        [[8, 1], 6560, "#698eff", "#46524c"], [[8, 2], 13121, "#0040ff", "#ebf6f1"], [[9, 1], 19682, "#ff7cf4", "#46524c"], [[9, 2], 39365, "#ff00ea", "#ebf6f1"],
        [[10, 1], 59048, "#ff7a78", "#46524c"], [[10, 2], 118097, "#da0300", "#ebf6f1"], [[11, 1], 177146, "#6ee4ff", "#46524c"], [[11, 2], 354293, "#0095e5", "#ebf6f1"],
        [[12, 1], 531440, "#ffbc6b", "#46524c"], [[12, 2], 1062881, "#ff8c00", "#ebf6f1"],
        [["@This 1", "=", 1], [3, "^", "@This 0", "-", 1], ["@HSLA", [97, "*", "@This 0", "-", 931], [0.9, "^", ["@This 0", "-", 12], "*", 100], 70, 1], "#46524c"],
        [["@This 1", "=", 2], [3, "^", "@This 0", "*", 2, "-", 1], ["@HSLA", [97, "*", "@This 0", "-", 931], [0.9, "^", ["@This 0", "-", 12], "*", 100], 35, 1], "#ebf6f1"]];
        MergeRules = [
            [2, [["@This 0", "=", 0], "&&", ["@Next 1 0", "=", 0]], true, [[1, 1]], 2, [false, true]],
            [3, [["@Next 1 0", "=", "@This 0"], "&&", ["@Next 1 1", "=", 1], "&&", ["@This 1", "=", 1], "&&", ["@Next 2 0", "=", 0], "&&", ["@Next 2 1", "=", 1]], false, [["@This 0", 2]], [3, "^", "@This 0", "*", 2, "-", 1], [false, true, true]],
            [3, [["@Next 1 0", "=", "@This 0"], "&&", ["@Next 1 1", "=", 2], "&&", ["@This 1", "=", 1], "&&", ["@Next 2 0", "=", 0], "&&", ["@Next 2 1", "=", 1]], false, [[["@This 0", "+", 1], 1]], [3, "^", ["@This 0", "+", 1], "-", 1], [false, true, true]]];
        startTileSpawns = [[[0, 1], 92], [[1, 1], 7], [[1, 2], 1]];
        winConditions = [[7, 1]];
        winRequirement = 1;
        document.documentElement.style.setProperty("background-image", "radial-gradient(#00ff8c 0%, #fff 150%)");
        document.documentElement.style.setProperty("--background-color", "#dafff0");
        document.documentElement.style.setProperty("--grid-color", "#a7c7be");
        document.documentElement.style.setProperty("--tile-color", "#c2ecda");
        document.documentElement.style.setProperty("--text-color", "#46524c");
        displayRules("rules_text", ["h2", "Powers of 3 Minus 1"], ["h1", "2186"], ["p","Two 1s can merge into a 2, but all other merges occur between three tiles: one of the tiles is always a 1, and one of them is always one less than a power of three, while the third tile can be either one less than that same power of three or one less than double that power of three. Get to the 2186 tile to win!"],
        ["p", "Spawning tiles: 1 (92%), 2 (7%), 5 (1%)"]);
        displayRules("gm_rules_text", ["h2", "Powers of 3 Minus 1"], ["h1", "2186"], ["p","Two 1s can merge into a 2, but all other merges occur between three tiles: one of the tiles is always a 1, and one of them is always one less than a power of three, while the third tile can be either one less than that same power of three or one less than double that power of three. Get to the 2186 tile to win!"],
        ["p", "Spawning tiles: 1 (92%), 2 (7%), 5 (1%)"]);
    }
    else if (mode == 14) { // 2049
        width = 5; height = 5; min_dim = 3;
        document.documentElement.style.setProperty("background-image", "radial-gradient(#ff0073 0%, #fff 150%)");
        document.documentElement.style.setProperty("--background-color", "#ffdae7");
        document.documentElement.style.setProperty("--grid-color", "#c7a7bb");
        document.documentElement.style.setProperty("--tile-color", "#ecc2dc");
        document.documentElement.style.setProperty("--text-color", "#52464e");
        //This mode has to completely reformat if the Negative Tiles modifier on, since it already has -1s in it even without Negative Tiles being on.
        if (modifiers[13] != "None") {
            TileNumAmount = 2;
            TileTypes = [
            [[-1, 1], 1, "#ffffff", "#52464e"],
            [[0, 1], 2, "#b6afff", "#52464e"], [[1, 1], 3, "#9086ff", "#52464e"], [[2, 1], 5, "#6a5cfc", "#52464e"], [[3, 1], 9, "#3624ff", "#52464e"],
            [[4, 1], 17, "#7c24ff", "#52464e"], [[5, 1], 33, "#bb00ff", "#52464e"], [[6, 1], 65, "#ee00ff", "#52464e"], [[7, 1], 129, "#ffb0d4", "#f9f2f5"],
            [[8, 1], 257, "#ff84bb", "#f9f2f5"], [[9, 1], 513, "#ff5ca5", "#f9f2f5"], [[10, 1], 1025, "#ff3590", "#f9f2f5"], [[11, 1], 2049, "#ff0073", "#f9f2f5"],
            [[12, 1], 4097, "#ffa078", "#f9f2f5"], [[13, 1], 8193, "#ff7a41", "#f9f2f5"], [[14, 1], 16385, "#ff4d00", "#f9f2f5"], [[15, 1], 32769, "#d33f00", "#f9f2f5"],
            [[16, 1], 65537, "#8d2a00", "#f9f2f5"], [[17, 1], 131073, "#ffbe5c", "#f9f2f5"], [[18, 1], 262145, "#ff9900", "#f9f2f5"], [[19, 1], 524289, "#c67700", "#f9f2f5"],
            [["@This 1", "=", 1], [2, "^", "@This 0", "+", 1], ["@HSLA", [15, "*", "@This 0", "-", 250], 100, [0.9, "^", ["@This 0", "-", 20], "*", 36], 1], "#f9f2f5"],
            [[-1, -1], -1, "#000000", "#adb9b1"],
            [[0, -1], -2, "#495000", "#adb9b1"], [[1, -1], -3, "#6f7900", "#adb9b1"], [[2, -1], -5, "#95a303", "#adb9b1"], [[3, -1], -9, "#c9db00", "#adb9b1"],
            [[4, -1], -17, "#83db00", "#adb9b1"], [[5, -1], -33, "#44ff00", "#adb9b1"], [[6, -1], -65, "#11ff00", "#adb9b1"], [[7, -1], -129, "#004f2b", "#060d0a"],
            [[8, -1], -257, "#007b44", "#060d0a"], [[9, -1], -513, "#00a35a", "#060d0a"], [[10, -1], -1025, "#00ca6f", "#060d0a"], [[11, -1], -2049, "#00ff8c", "#060d0a"],
            [[12, -1], -4097, "#005f87", "#060d0a"], [[13, -1], -8193, "#0085be", "#060d0a"], [[14, -1], -16385, "#00b2ff", "#060d0a"], [[15, -1], -32769, "#2cc0ff", "#060d0a"],
            [[16, -1], -65537, "#72d5ff", "#060d0a"], [[17, -1], -131073, "#0041a3", "#060d0a"], [[18, -1], -262145, "#0066ff", "#060d0a"], [[19, -1], -524289, "#3988ff", "#060d0a"],
            [["@This 1", "=", -1], [2, "^", "@This 0", "+", 1, "*", -1], ["@HSLA", [15, "*", "@This 0", "-", 70], 100, [100, "-", [0.9, "^", ["@This 0", "-", 20], "*", 36]], 1], "#060d0a"]
            ];
            MergeRules = [
                [2, [["@Next 1 0", "=", -1], "&&", ["@This 0", "=", -1], "&&", ["@Next 1 1", "=", "@This 1"]], false, [[0, ["@This 1"]]], 2, [false, true]],
                [3, [["@Next 1 0", "=", "@This 0"], "&&", ["@Next 2 0", "=", -1], "&&", ["@This 0", "typeof", "=", "number"], "&&", ["@Next 1 1", "=", "@This 1"], "&&", ["@Next 2 1", "!=", "@This 1"]], false, [[["@This 0", "+", 1], ["@This 1"]]], [2, "^", ["@This 0", "+", 1], "-", 1], [false, true, true]]
            ];
            if (modifiers[13] == "Interacting") MergeRules.unshift([2, [["@Next 1 0", "=", "@This 0"], "&&", ["@Next 1 1", "!=", "@This 1"]], false, [], 0, [true, true]]);
            startTileSpawns = [[[-1, 1], 50], [[-1, -1], 50]];
            winConditions = [[11, -1], [11, -1]];
            winRequirement = 2;
            displayRules("rules_text", ["h2", "Powers of 2 Plus 1"], ["h1", "2049"], ["p", "This mode, due to already having negatives, is slightly adjusted with Negative Tiles turned on. Two 1s or two -1s can merge, but all other merges occur between three tiles: two of them must be equal to each other and not 1s or -1s, and the third must be a 1 of the opposite sign to the first two. Get to the 2049 and -2049 tiles to win!"],
            ["p", "Spawning tiles: 1 (50%), -1 (50%)"]);
            displayRules("gm_rules_text", ["h2", "Powers of 2 Plus 1"], ["h1", "2049"], ["p", "This mode, due to already having negatives, is slightly adjusted with Negative Tiles turned on. Two 1s or two -1s can merge, but all other merges occur between three tiles: two of them must be equal to each other and not 1s or -1s, and the third must be a 1 of the opposite sign to the first two. Get to the 2049 and -2049 tiles to win!"],
            ["p", "Spawning tiles: 1 (50%), -1 (50%)"]);
        }
        else {
            TileNumAmount = 1;
            TileTypes = [[[-2], -1, "#444444", "#bbbbbb"], [[-1], 1, "#ffffff", "#52464e"],
            [[0], 2, "#b6afff", "#52464e"], [[1], 3, "#9086ff", "#52464e"], [[2], 5, "#6a5cfc", "#52464e"], [[3], 9, "#3624ff", "#52464e"],
            [[4], 17, "#7c24ff", "#52464e"], [[5], 33, "#bb00ff", "#52464e"], [[6], 65, "#ee00ff", "#52464e"], [[7], 129, "#ffb0d4", "#f9f2f5"],
            [[8], 257, "#ff84bb", "#f9f2f5"], [[9], 513, "#ff5ca5", "#f9f2f5"], [[10], 1025, "#ff3590", "#f9f2f5"], [[11], 2049, "#ff0073", "#f9f2f5"],
            [[12], 4097, "#ffa078", "#f9f2f5"], [[13], 8193, "#ff7a41", "#f9f2f5"], [[14], 16385, "#ff4d00", "#f9f2f5"], [[15], 32769, "#d33f00", "#f9f2f5"],
            [[16], 65537, "#8d2a00", "#f9f2f5"], [[17], 131073, "#ffbe5c", "#f9f2f5"], [[18], 262145, "#ff9900", "#f9f2f5"], [[19], 524289, "#c67700", "#f9f2f5"],
            [true, [2, "^", "@This 0", "+", 1], ["@HSLA", [15, "*", "@This 0", "-", 250], 100, [0.9, "^", ["@This 0", "-", 20], "*", 36], 1], "#f9f2f5"]];
            MergeRules = [
                [2, [["@Next 1 0", "=", -1], "&&", ["@This 0", "=", -1]], false, [[0]], 2, [false, true]],
                [2, [["@Next 1 0", "=", -1], "&&", ["@This 0", "=", -2]], false, [], 0, [true, true]],
                [3, [["@Next 1 0", "=", "@This 0"], "&&", ["@Next 2 0", "=", -2], "&&", ["@This 0", "typeof", "=", "number"], "&&", ["@This 0", ">", -1]], false, [[["@This 0", "+", 1]]], [2, "^", ["@This 0", "+", 1], "-", 1], [false, true, true]]
            ];
            startTileSpawns = [[[-1], 65], [[-2], 35]];
            winConditions = [[11]];
            winRequirement = 1;
            displayRules("rules_text", ["h2", "Powers of 2 Plus 1"], ["h1", "2049"], ["p", "Two 1s can merge, but all other merges occur between three tiles: two of them must be equal to each other and not 1s or -1s, and the third must be a -1. But be careful, because if a 1 and a -1 collide, they're both destroyed. Get to the 2049 tile to win!"],
            ["p", "Spawning tiles: 1 (65%), -1 (35%)"]);
            displayRules("gm_rules_text", ["h2", "Powers of 2 Plus 1"], ["h1", "2049"], ["p", "Two 1s can merge, but all other merges occur between three tiles: two of them must be equal to each other and not 1s or -1s, and the third must be a -1. But be careful, because if a 1 and a -1 collide, they're both destroyed. Get to the 2049 tile to win!"],
            ["p", "Spawning tiles: 1 (65%), -1 (35%)"]);
        }
    }
    else if (mode == 15) { // 5040
        width = 5; height = 5; min_dim = 4;
        TileNumAmount = 2;
        TileTypes = [[[1, 1], 1, "#ffd900", "#776e65"],
        [[2, 1], 2, "#ff5ae6", "#584153"], [[2, 2], 4, "#d600b6", "#f6ebf4"],
        [[3, 1], 6, "#ff0000", "#564040"], [[3, 3], 18, "#950000", "#f4ecec"],
        [[4, 1], 24, "#e9ff9f", "#505246"], [[4, 2], 48, "#dafe65", "#505246"], [[4, 3], 72, "#c9ff16", "#f4f7e9"], [[4, 4], 96, "#abe000", "#f4f7e9"],
        [[5, 1], 120, "#00a6ff", "#464d52"], [[5, 2], 240, "#007bbe", "#464d52"], [[5, 3], 360, "#69caff", "#464d52"],
        [[6, 1], 720, "#ff9d00", "#524b46"], [[6, 2], 1440, "#d58300", "#f1ebe7"], [[6, 3], 2160, "#ffc972", "#6d6a67"], [[6, 4], 2880, "#a26400", "#f1ebe7"],
        [[7, 1], 5040, "#6b5aff", "#484652"], [[7, 2], 10080, "#1900ff", "#484652"], [[7, 3], 15120, "#1300be", "#e8e6f3"], [[7, 5], 25200, "#0c007a", "#e8e6f3"],
        [[8, 1], 40320, "#44f6ff", "#465252"], [[8, 4], 161280, "#00afb8", "#e2e9e9"],
        [[9, 1], 362800, "#ffa981", "#524946"], [[9, 2], 725760, "#ff834a", "#524946"], [[9, 5], 1814400, "#ff5100", "#524946"],
        [[10, 1], 3628800, "#92ff92", "#485246"], [[10, 2], 7257600, "#00ff00", "#485246"], [[10, 3], 10886400, "#00b800", "#e1edde"], [[10, 6], 21772800, "#006c00", "#e1edde"],
        [[11, 1], 39916800, "#d000ff", "#584e59"], [[11, 2], 79833600, "#9a00bc", "#f4edf6"], [[11, 3], 119750400, "#e261ff", "#2d292e"], [[11, 4], 159667200, "#610077", "#f4edf6"], [[11, 6], 239500800, "#ac27ca", "#584e59"],
        [[12, 1], 479001600, "#000000", "#ffff00"]
        ];
        MergeRules = [ //No generalizing here; different tiers have different merge rule, so every case gets its own rule
            [2, [["@This 0", "=", 1], "&&", ["@Next 1 0", "=", 1]], true, [[2, 1]], 2, [false, true]],

            [2, [["@This 0", "=", 2], "&&", ["@Next 1 0", "=", 2], "&&", ["@Next 1 1", "=", 1], "&&", ["@This 1", "=", 1]], true, [[2, 2]], 4, [false, true]],
            [2, [["@This 0", "=", 2], "&&", ["@Next 1 0", "=", 2], "&&", ["@Next 1 1", "=", 2], "&&", ["@This 1", "=", 1]], false, [[3, 1]], 6, [false, true]],

            [3, [["@This 0", "=", 3], "&&", ["@Next 1 0", "=", 3], "&&", ["@Next 2 0", "=", 3], "&&", ["@Next 1 1", "=", 1], "&&", ["@Next 2 1", "=", 1], "&&", ["@This 1", "=", 1]], true, [[3, 3]], 18, [false, true, true]],
            [2, [["@This 0", "=", 3], "&&", ["@Next 1 0", "=", 3], "&&", ["@Next 1 1", "=", 3], "&&", ["@This 1", "=", 1]], false, [[4, 1]], 24, [false, true]],

            [2, [["@This 0", "=", 4], "&&", ["@Next 1 0", "=", 4], "&&", ["@Next 1 1", "+", "@This 1", "<", 5]], true, [[4, ["@Next 1 1", "+", "@This 1"]]], [24, "*", ["@Next 1 1", "+", "@This 1"]], [false, true]],
            [2, [["@This 0", "=", 4], "&&", ["@Next 1 0", "=", 4], "&&", ["@Next 1 1", "+", "@This 1", "=", 5]], true, [[5, 1]], 120, [false, true]],

            [3, [["@This 0", "=", 5], "&&", ["@Next 1 0", "=", "@This 0"], "&&", ["@Next 1 1", "=", "@This 1"], "&&", ["@Next 2 0", "=", "@This 0"], "&&", ["@Next 2 1", "=", "@This 1"], "&&", ["@This 1", "=", 1]], true, [[5, 3]], 360, [false, true, true]],
            [3, [["@This 0", "=", 5], "&&", ["@Next 1 0", "=", "@This 0"], "&&", ["@Next 1 1", "=", "@This 1"], "&&", ["@Next 2 0", "=", "@This 0"], "&&", ["@Next 2 1", "=", "@This 1"], "&&", ["@This 1", "=", 2]], true, [[6, 1]], 720, [false, true, true]],
            [2, [["@NextNE -1 0", "!=", "@This 0"], "||", ["@NextNE -1 1", "!=", "@This 1"], "&&", ["@This 0", "=", 5], "&&", ["@Next 1 0", "=", "@This 0"], "&&", ["@Next 1 1", "=", "@This 1"], "&&", ["@This 1", "=", 1]], true, [[5, 2]], 240, [false, true]],
            [2, [["@This 0", "=", 5], "&&", ["@Next 1 0", "=", "@This 0"], "&&", ["@Next 1 1", "=", "@This 1"], "&&", ["@This 1", "=", 3]], true, [[6, 1]], 720, [false, true]],

            [3, [["@This 0", "=", 6], "&&", ["@Next 1 0", "=", "@This 0"], "&&", ["@Next 1 1", "=", "@This 1"], "&&", ["@Next 2 0", "=", "@This 0"], "&&", ["@Next 2 1", "=", "@This 1"], "&&", ["@This 1", "=", 1]], true, [[6, 3]], 2160, [false, true, true]],
            [2, [["@NextNE -1 0", "!=", "@This 0"], "||", ["@NextNE -1 1", "!=", "@This 1"], "&&", ["@This 0", "=", 6], "&&", ["@Next 1 0", "=", "@This 0"], "&&", ["@Next 1 1", "=", "@This 1"], "&&", ["@This 1", "=", 1]], true, [[6, 2]], 1440, [false, true]],
            [2, [["@This 0", "=", 6], "&&", ["@Next 1 0", "=", "@This 0"], "&&", ["@Next 1 1", "=", "@This 1"], "&&", ["@This 1", "=", 2]], true, [[6, 4]], 2880, [false, true]],
            [2, [["@This 0", "=", 6], "&&", ["@Next 1 0", "=", "@This 0"], "&&", ["@Next 1 1", "=", 3], "&&", ["@This 1", "=", 4]], false, [[7, 1]], 5040, [false, true]],

            [2, [["@This 0", "=", 7], "&&", ["@Next 1 0", "=", "@This 0"], "&&", ["@Next 1 1", "=", 1], "&&", ["@This 1", "=", 1]], false, [[7, 2]], 10080, [false, true]],
            [2, [["@This 0", "=", 7], "&&", ["@Next 1 0", "=", "@This 0"], "&&", ["@Next 1 1", "=", 2], "&&", ["@This 1", "=", 1]], false, [[7, 3]], 15120, [false, true]],
            [2, [["@This 0", "=", 7], "&&", ["@Next 1 0", "=", "@This 0"], "&&", ["@Next 1 1", "=", 3], "&&", ["@This 1", "=", 2]], false, [[7, 5]], 25200, [false, true]],
            [2, [["@This 0", "=", 7], "&&", ["@Next 1 0", "=", "@This 0"], "&&", ["@Next 1 1", "=", 5], "&&", ["@This 1", "=", 3]], false, [[8, 1]], 40320, [false, true]],

            [4, [["@This 0", "=", 8], "&&", ["@Next 1 0", "=", "@This 0"], "&&", ["@Next 1 1", "=", "@This 1"], "&&", ["@Next 2 0", "=", "@This 0"], "&&", ["@Next 2 1", "=", "@This 1"], "&&", ["@Next 3 0", "=", "@This 0"], "&&", ["@Next 3 1", "=", "@This 1"],"&&", ["@This 1", "=", 1]], true, [[8, 4]], 161280, [false, true, true, true]],
            [3, [["@This 0", "=", 8], "&&", ["@Next 1 0", "=", "@This 0"], "&&", ["@Next 2 0", "=", "@This 0"], "&&", ["@This 1", "=", 1], "&&", ["@Next 1 1", "=", 4], "&&", ["@Next 2 1", "=", 4]], false, [[9, 1]], 362880, [false, true, true]],

            [2, [["@This 0", "=", 9], "&&", ["@Next 1 0", "=", "@This 0"], "&&", ["@Next 1 1", "=", 1], "&&", ["@This 1", "=", 1]], false, [[9, 2]], 725760, [false, true]],
            [3, [["@This 0", "=", 9], "&&", ["@Next 1 0", "=", "@This 0"], "&&", ["@Next 2 0", "=", "@This 0"], "&&", ["@This 1", "=", 1], "&&", ["@Next 1 1", "=", 2], "&&", ["@Next 2 1", "=", 2]], false, [[9, 5]], 1814400, [false, true, true]],
            [2, [["@This 0", "=", 9], "&&", ["@Next 1 0", "=", "@This 0"], "&&", ["@Next 1 1", "=", 5], "&&", ["@This 1", "=", 5]], false, [[10, 1]], 3628800, [false, true]],

            [3, [["@This 0", "=", 10], "&&", ["@Next 1 0", "=", "@This 0"], "&&", ["@Next 2 0", "=", "@This 0"], "&&", ["@Next 2 1", "=", 3], "&&", ["@Next 1 1", "=", 2], "&&", ["@This 1", "=", 1]], false, [[10, 6]], 21772800, [false, true, true]],
            [3, [["@This 0", "=", 10], "&&", ["@Next 1 0", "=", "@This 0"], "&&", ["@Next 2 0", "=", "@This 0"], "&&", ["@Next 2 1", "=", 6], "&&", ["@Next 1 1", "=", 3], "&&", ["@This 1", "=", 2]], false, [[11, 1]], 39916800, [false, true, true]],
            [2, [["@This 0", "=", 10], "&&", ["@Next 1 0", "=", "@This 0"], "&&", ["@Next 1 1", "=", 1], "&&", ["@This 1", "=", 1]], false, [[10, 2]], 7257600, [false, true]],
            [2, [["@This 0", "=", 10], "&&", ["@Next 1 0", "=", "@This 0"], "&&", ["@Next 1 1", "=", 2], "&&", ["@This 1", "=", 1], "&&", [["@NextNE -1 0", "!=", "@This 0"], "||", ["@NextNE -1 1", "!=", 3]]], false, [[10, 3]], 10886400, [false, true]],

            [4, [["@This 0", "=", 11], "&&", ["@Next 1 0", "=", "@This 0"], "&&", ["@Next 1 1", "=", "@This 1"], "&&", ["@Next 2 0", "=", "@This 0"], "&&", ["@Next 2 1", "=", "@This 1"], "&&", ["@Next 3 0", "=", "@This 0"], "&&", ["@Next 3 1", "=", "@This 1"], "&&", ["@This 1", "=", 1]], true, [[11, 4]], 159667200, [false, true, true, true]],
            [4, [["@This 0", "=", 11], "&&", ["@Next 1 0", "=", "@This 0"], "&&", ["@Next 1 1", "=", "@This 1"], "&&", ["@Next 2 0", "=", "@This 0"], "&&", ["@Next 2 1", "=", "@This 1"], "&&", ["@Next 3 0", "=", "@This 0"], "&&", ["@Next 3 1", "=", "@This 1"], "&&", ["@This 1", "=", 3]], true, [[12, 1]], 479001600, [false, true, true, true]],
            [3, [["@NextNE -1 0", "!=", "@This 0"], "||", ["@NextNE -1 1", "!=", "@This 1"], "&&", ["@This 0", "=", 11], "&&",  ["@Next 1 0", "=", "@This 0"], "&&", ["@Next 1 1", "=", "@This 1"], "&&", ["@Next 2 0", "=", "@This 0"], "&&", ["@Next 2 1", "=", "@This 1"], "&&", ["@This 1", "=", 1]], true, [[11, 3]], 119750400, [false, true, true]],
            [3, [["@This 0", "=", 11], "&&", ["@Next 1 0", "=", "@This 0"], "&&", ["@Next 1 1", "=", "@This 1"], "&&", ["@Next 2 0", "=", "@This 0"], "&&", ["@Next 2 1", "=", "@This 1"], "&&", ["@This 1", "=", 2]], true, [[11, 6]], 239500800, [false, true, true]],
            [3, [["@This 0", "=", 11], "&&", ["@Next 1 0", "=", "@This 0"], "&&", ["@Next 1 1", "=", "@This 1"], "&&", ["@Next 2 0", "=", "@This 0"], "&&", ["@Next 2 1", "=", "@This 1"], "&&", ["@This 1", "=", 4]], true, [[12, 1]], 479001600, [false, true, true]],
            [2, [["@NextNE -1 0", "!=", "@This 0"], "||", ["@NextNE -1 1", "!=", "@This 1"], "&&", ["@This 0", "=", 11], "&&",  ["@Next 1 0", "=", "@This 0"], "&&", ["@Next 1 1", "=", "@This 1"], "&&", ["@This 1", "=", 1]], true, [[11, 2]], 79833600, [false, true]],
            [2, [["@NextNE -1 0", "!=", "@This 0"], "||", ["@NextNE -1 1", "!=", "@This 1"], "&&", ["@This 0", "=", 11], "&&",  ["@Next 1 0", "=", "@This 0"], "&&", ["@Next 1 1", "=", "@This 1"], "&&", ["@This 1", "=", 2]], true, [[11, 4]], 159667200, [false, true]],
            [2, [[["@Next -2 0", "!=", "@This 0"], "||", ["@Next -2 1", "!=", "@This 1"]], "&&", [["@Next 2 0", "!=", "@This 0"], "||", ["@Next 2 1", "!=", "@This 1"]], "||", ["@NextNE -1 0", "!=", "@This 0"], "||", ["@NextNE -1 1", "!=", "@This 1"], "&&", ["@This 0", "=", 11], "&&", ["@Next 1 0", "=", "@This 0"], "&&", ["@Next 1 1", "=", "@This 1"], "&&", ["@This 1", "=", 3]], true, [[11, 6]], 239500800, [false, true]],
            [2, [["@This 0", "=", 11], "&&", ["@Next 1 0", "=", "@This 0"], "&&", ["@Next 1 1", "=", "@This 1"], "&&", ["@This 1", "=", 6]], true, [[12, 1]], 479001600, [false, true]]
        ]
        startTileSpawns = [[[1, 1], 100]];
        winConditions = [[7, 1]];
        winRequirement = 1;
        document.documentElement.style.setProperty("background-image", "radial-gradient(#ffff00 0%, #fff 150%)");
        document.documentElement.style.setProperty("--background-color", "#fffeda");
        document.documentElement.style.setProperty("--grid-color", "#c7c6a7");
        document.documentElement.style.setProperty("--tile-color", "#eceac2");
        document.documentElement.style.setProperty("--text-color", "#525146");
        displayRules("rules_text", ["h2", "Factorials"], ["h1", "5040"], ["p","For any whole number x between 1 and 11, tiles that are at least x! and less than (x+1)! follow the merging rules of the gamemode based around powers of (x+1), with x! taking the place of the powers of (x+1) within that particular ruleset. Get to the 5040 tile to win!"],
        ["p", "Spawning tiles: 1 (100%)"]);
        displayRules("gm_rules_text", ["h2", "Factorials"], ["h1", "5040"], ["p","For any whole number x between 1 and 11, tiles that are at least x! and less than (x+1)! follow the merging rules of the gamemode based around powers of (x+1), with x! taking the place of the powers of (x+1) within that particular ruleset. Get to the 5040 tile to win!"],
        ["p", "Spawning tiles: 1 (100%)"]);
    }
    else if (mode == 16) { // 2197
        width = 4; height = 4; min_dim = 2;
        TileNumAmount = 2;
        TileTypes = [
        [[0, 1], 1, "#305300", "#f7eaf4"], [[0, 2], 2, "#528d00", "#f7eaf4"], [[0, 3], 3, "#72c400", "#f7eaf4"],
        [[0, 4], 4, "#95ff00", "#272326"], [[0, 6], 6, "#beff63", "#272326"], [[0, 9], 9, "#dbffa8", "#272326"],
        [[1, 1], 13, "#4d0067", "#f7eaf4"], [[1, 2], 26, "#7a00a3", "#f7eaf4"], [[1, 3], 39, "#a203d6", "#f7eaf4"],
        [[1, 4], 52, "#bf00ff", "#272326"], [[1, 6], 78, "#d452ff", "#272326"], [[1, 9], 117, "#e38fff", "#272326"],
        [[2, 1], 169, "#642600", "#f7eaf4"], [[2, 2], 338, "#9c3c00", "#f7eaf4"], [[2, 3], 507, "#cc4e00", "#f7eaf4"],
        [[2, 4], 676, "#ff6200", "#272326"], [[2, 6], 1014, "#ff8a41", "#272326"], [[2, 9], 1521, "#ffb07e", "#272326"],
        [[3, 1], 2197, "#57004a", "#f7eaf4"], [[3, 2], 4394, "#970080", "#f7eaf4"], [[3, 3], 6591, "#c400a6", "#f7eaf4"],
        [[3, 4], 8788, "#ff00d9", "#272326"], [[3, 6], 13182, "#ff52e5", "#272326"], [[3, 9], 19773, "#ff84ed", "#272326"],
        [[4, 1], 28561, "#6e6700", "#f7eaf4"], [[4, 2], 57122, "#9f9400", "#f7eaf4"], [[4, 3], 85683, "#c9bc00", "#f7eaf4"],
        [[4, 4], 114244, "#ffee00", "#272326"], [[4, 6], 171366, "#fff67d", "#272326"], [[4, 9], 257049, "#fffab5", "#272326"],
        [[5, 1], 371293, "#00636e", "#f7eaf4"], [[5, 2], 742586, "#008e9d", "#f7eaf4"], [[5, 3], 1113879, "#00b4c8", "#f7eaf4"],
        [[5, 4], 1485172, "#00e5ff", "#272326"], [[5, 6], 2227758, "#71f1ff", "#272326"], [[5, 9], 3341637, "#b1f7ff", "#272326"],
        [["@This 1", "=", 1], [13, "^", "@This 0"], ["@HSLA", [103, "*", "@This 0", "-", 321], [0.9, "^", ["@This 0", "-", 6], "*", 100], 20, 1], "#f7eaf4"],
        [["@This 1", "=", 2], [13, "^", "@This 0", "*", 2], ["@HSLA", [103, "*", "@This 0", "-", 321], [0.9, "^", ["@This 0", "-", 6], "*", 100], 30, 1], "#f7eaf4"],
        [["@This 1", "=", 3], [13, "^", "@This 0", "*", 3], ["@HSLA", [103, "*", "@This 0", "-", 321], [0.9, "^", ["@This 0", "-", 6], "*", 100], 40, 1], "#f7eaf4"],
        [["@This 1", "=", 4], [13, "^", "@This 0", "*", 4], ["@HSLA", [103, "*", "@This 0", "-", 321], [0.9, "^", ["@This 0", "-", 6], "*", 100], 50, 1], "#272326"],
        [["@This 1", "=", 6], [13, "^", "@This 0", "*", 6], ["@HSLA", [103, "*", "@This 0", "-", 321], [0.9, "^", ["@This 0", "-", 6], "*", 100], 65, 1], "#272326"],
        [["@This 1", "=", 9], [13, "^", "@This 0", "*", 9], ["@HSLA", [103, "*", "@This 0", "-", 321], [0.9, "^", ["@This 0", "-", 6], "*", 100], 80, 1], "#272326"],
        ]
        MergeRules = [
            [2, [["@Next 1 0", "=", "@This 0"], "&&", ["@Next 1 1", "=", 1], "&&", ["@This 1", "=", 1]], false, [["@This 0", 2]], [13, "^", "@This 0", "*", 2], [false, true]],
            [2, [["@Next 1 0", "=", "@This 0"], "&&", ["@Next 1 1", "=", 2], "&&", ["@This 1", "=", 1]], false, [["@This 0", 3]], [13, "^", "@This 0", "*", 3], [false, true]],
            [2, [["@Next 1 0", "=", "@This 0"], "&&", ["@Next 1 1", "=", 3], "&&", ["@This 1", "=", 1]], false, [["@This 0", 4]], [13, "^", "@This 0", "*", 4], [false, true]],
            [2, [["@Next 1 0", "=", "@This 0"], "&&", ["@Next 1 1", "=", 4], "&&", ["@This 1", "=", 2]], false, [["@This 0", 6]], [13, "^", "@This 0", "*", 6], [false, true]],
            [2, [["@Next 1 0", "=", "@This 0"], "&&", ["@Next 1 1", "=", 6], "&&", ["@This 1", "=", 3]], false, [["@This 0", 9]], [13, "^", "@This 0", "*", 9], [false, true]],
            [2, [["@Next 1 0", "=", "@This 0"], "&&", ["@Next 1 1", "=", 9], "&&", ["@This 1", "=", 4]], false, [[["@This 0", "+", 1], 1]], [13, "^", "@This 0", "*", 13], [false, true]],
        ]
        startTileSpawns = [[[0, 1], 85], [[0, 2], 8], [[0, 3], 5], [[0, 4], 2]];
        winConditions = [[3, 1]];
        winRequirement = 1;
        document.documentElement.style.setProperty("background-image", "radial-gradient(#6f0062 0%, #fff 150%)");
        document.documentElement.style.setProperty("--background-color", "#c9abc1");
        document.documentElement.style.setProperty("--grid-color", "#9d8597");
        document.documentElement.style.setProperty("--tile-color", "#ba9db3");
        document.documentElement.style.setProperty("--text-color", "#272326");
        displayRules("rules_text", ["h2", "Powers of 13"], ["h1", "2197"], ["p","Merges occur between two equal tiles that are a power of 13, between a tile that's a power of eight and a tile that's double or triple that power of 13, between a tile that's double a power of 13 and a tile that's quadruple that power of 13, between a tile that's triple a power of 13 and a tile that's sextuple that power of 13, or between a tile that's quadruple a power of 13 and a tile that's 9 times that power of 13. Get to the 2197 tile to win!"],
        ["p", "Spawning tiles: 1 (85%), 2 (8%), 3 (5%), 4 (2%)"]);
        displayRules("gm_rules_text", ["h2", "Powers of 13"], ["h1", "2197"], ["p","Merges occur between two equal tiles that are a power of 13, between a tile that's a power of eight and a tile that's double or triple that power of 13, between a tile that's double a power of 13 and a tile that's quadruple that power of 13, between a tile that's triple a power of 13 and a tile that's sextuple that power of 13, or between a tile that's quadruple a power of 13 and a tile that's 9 times that power of 13. Get to the 2197 tile to win!"],
        ["p", "Spawning tiles: 1 (85%), 2 (8%), 3 (5%), 4 (2%)"]);
    }
    else if (mode == 17) { // 3375
        width = 4; height = 4; min_dim = 2;
        TileNumAmount = 2;
        TileTypes = [
        [[0, 1], 1, "#ffffff", "#665b57"], [[0, 2], 2, "#f3ceff", "#665b57"], [[0, 4], 4, "#e69bff", "#665b57"],
        [[0, 8], 8, "#d863ff", "#665b57"], [[0, 9], 9, "#bf00ff", "#665b57"], [[0, 11], 11, "#9500ff", "#665b57"],
        [[1, 1], 15, "#c5f9ff", "#665b57"], [[1, 2], 30, "#a4f6ff", "#665b57"], [[1, 4], 60, "#70f1ff", "#665b57"],
        [[1, 8], 120, "#32eaff", "#665b57"], [[1, 9], 135, "#00c3ff", "#665b57"], [[1, 11], 165, "#0088ff", "#665b57"],
        [[2, 1], 225, "#f1ffb8", "#665b57"], [[2, 2], 450, "#e8ff8d", "#665b57"], [[2, 4], 900, "#dffe62", "#665b57"],
        [[2, 8], 1800, "#ccff00", "#665b57"], [[2, 9], 2025, "#91ff00", "#665b57"], [[2, 11], 2475, "#00ff00", "#665b57"],
        [[3, 1], 3375, "#ffb096", "#665b57"], [[3, 2], 6750, "#ff936e", "#665b57"], [[3, 4], 13500, "#ff6e3e", "#665b57"],
        [[3, 8], 27000, "#ff4000", "#665b57"], [[3, 9], 30375, "#ff1500", "#665b57"], [[3, 11], 37125, "#ff0055", "#665b57"],
        [[4, 1], 50625, "#9d9dff", "#665b57"], [[4, 2], 101250, "#7a7aff", "#665b57"], [[4, 4], 202500, "#5f5fff", "#665b57"],
        [[4, 8], 405000, "#3f3fff", "#665b57"], [[4, 9], 455625, "#0000ff", "#665b57"], [[4, 11], 556875, "#6a00ff", "#665b57"],
        [[5, 1], 759375, "#fff5b5", "#665b57"], [[5, 2], 1518750, "#ffef86", "#665b57"], [[5, 4], 3037500, "#ffe853", "#665b57"],
        [[5, 8], 6075000, "#ffdd00", "#665b57"], [[5, 9], 6834375, "#ffbb00", "#665b57"], [[5, 11], 8353125, "#ff9900", "#665b57"],
        [[6, 1], 11390625, "#ffb7ff", "#665b57"], [[6, 2], 22781250, "#ff8bff", "#665b57"], [[6, 4], 45562500, "#ff62ff", "#665b57"],
        [[6, 8], 91125000, "#ff00ff", "#665b57"], [[6, 9], 102515625, "#ff00e1", "#665b57"], [[6, 11], 125296875, "#ff00ae", "#665b57"],
        [["@This 1", "=", 1], [15, "^", "@This 0"], ["@HSVA", [-97, "*", "@This 0", "+", 889], 30, [0.9, "^", ["@This 0", "-", 6], "*", 100], 1], "#f0dfd8"],
        [["@This 1", "=", 2], [15, "^", "@This 0", "*", 2], ["@HSVA", [-97, "*", "@This 0", "+", 889], 45, [0.9, "^", ["@This 0", "-", 6], "*", 100], 1], "#f0dfd8"],
        [["@This 1", "=", 4], [15, "^", "@This 0", "*", 4], ["@HSVA", [-97, "*", "@This 0", "+", 889], 65, [0.9, "^", ["@This 0", "-", 6], "*", 100], 1], "#f0dfd8"],
        [["@This 1", "=", 8], [15, "^", "@This 0", "*", 8], ["@HSVA", [-97, "*", "@This 0", "+", 889], 100, [0.9, "^", ["@This 0", "-", 6], "*", 100], 1], "#f0dfd8"],
        [["@This 1", "=", 9], [15, "^", "@This 0", "*", 9], ["@HSVA", [-97, "*", "@This 0", "+", 904], 100, [0.9, "^", ["@This 0", "-", 6], "*", 100], 1], "#f0dfd8"],
        [["@This 1", "=", 11], [15, "^", "@This 0", "*", 11], ["@HSVA", [-97, "*", "@This 0", "+", 919], 100, [0.9, "^", ["@This 0", "-", 6], "*", 100], 1], "#f0dfd8"],
        ]
        MergeRules = [
            [2, [["@Next 1 0", "=", "@This 0"], "&&", ["@Next 1 1", "=", 1], "&&", ["@This 1", "=", 1]], false, [["@This 0", 2]], [15, "^", "@This 0", "*", 2], [false, true]],
            [2, [["@Next 1 0", "=", "@This 0"], "&&", ["@Next 1 1", "=", 2], "&&", ["@This 1", "=", 2]], false, [["@This 0", 4]], [15, "^", "@This 0", "*", 4], [false, true]],
            [2, [["@Next 1 0", "=", "@This 0"], "&&", ["@Next 1 1", "=", 4], "&&", ["@This 1", "=", 4]], false, [["@This 0", 8]], [15, "^", "@This 0", "*", 8], [false, true]],
            [2, [["@Next 1 0", "=", "@This 0"], "&&", ["@Next 1 1", "=", 8], "&&", ["@This 1", "=", 1]], false, [["@This 0", 9]], [15, "^", "@This 0", "*", 9], [false, true]],
            [2, [["@Next 1 0", "=", "@This 0"], "&&", ["@Next 1 1", "=", 9], "&&", ["@This 1", "=", 2]], false, [["@This 0", 11]], [15, "^", "@This 0", "*", 11], [false, true]],
            [2, [["@Next 1 0", "=", "@This 0"], "&&", ["@Next 1 1", "=", 11], "&&", ["@This 1", "=", 4]], false, [[["@This 0", "+", 1], 1]], [15, "^", "@This 0", "*", 15], [false, true]],
        ]
        startTileSpawns = [[[0, 1], 85], [[0, 2], 12], [[0, 4], 3]];
        winConditions = [[3, 1]];
        winRequirement = 1;
        document.documentElement.style.setProperty("background-image", "radial-gradient(#ff8258 0%, #fff 150%)");
        document.documentElement.style.setProperty("--background-color", "#ffece8");
        document.documentElement.style.setProperty("--grid-color", "#e7c4b6");
        document.documentElement.style.setProperty("--tile-color", "#ffddd0");
        document.documentElement.style.setProperty("--text-color", "#665b57");
        displayRules("rules_text", ["h2", "Powers of 15"], ["h1", "3375"], ["p","Merges occur between a tile that's a power of 15 and a tile that's equal to or eight times that power of 15, between a tile that's double a power of 15 and a tile that's double or nine times that power of 15, or between a tile that's quadruple a power of 15 and a tile that's quadruple or 11 times that power of 15. Get to the 3375 tile to win!"],
        ["p", "Spawning tiles: 1 (85%), 2 (12%), 4 (3%)"]);
        displayRules("gm_rules_text", ["h2", "Powers of 15"], ["h1", "3375"], ["p","Merges occur between a tile that's a power of 15 and a tile that's equal to or eight times that power of 15, between a tile that's double a power of 15 and a tile that's double or nine times that power of 15, or between a tile that's quadruple a power of 15 and a tile that's quadruple or 11 times that power of 15. Get to the 3375 tile to win!"],
        ["p", "Spawning tiles: 1 (85%), 2 (12%), 4 (3%)"]);
    }
    else if (mode == 18) { // 4913
        width = 5; height = 5; min_dim = 3;
        TileNumAmount = 2;
        TileTypes = [
            [[0, 1], 1, "#ffffff", "#3d443c"], [[0, 3], 3, "#c1c1ff", "#3d443c"], [[0, 5], 5, "#9090ff", "#f1faef"], [[0, 11], 11, "#6363ff", "#f1faef"],
            [[1, 1], 17, "#ff93ff", "#3d443c"], [[1, 3], 51, "#ff5cff", "#3d443c"], [[1, 5], 85, "#ff00ff", "#f1faef"], [[1, 11], 187, "#be00be", "#f1faef"],
            [[2, 1], 289, "#ffc17f", "#3d443c"], [[2, 3], 867, "#ffab51", "#3d443c"], [[2, 5], 1445, "#ff8400", "#f1faef"], [[2, 11], 3179, "#c56600", "#f1faef"],
            [[3, 1], 4913, "#90ff90", "#3d443c"], [[3, 3], 14739, "#00ff00", "#3d443c"], [[3, 5], 24565, "#00d000", "#f1faef"], [[3, 11], 54043, "#008f00", "#f1faef"],
            [[4, 1], 83521, "#8ee5ff", "#3d443c"], [[4, 3], 250563, "#57d8ff", "#3d443c"], [[4, 5], 417605, "#00c3ff", "#f1faef"], [[4, 11], 918731, "#009bca", "#f1faef"],
            [[5, 1], 1419857, "#d68aff", "#3d443c"], [[5, 3], 4259571, "#c559ff", "#3d443c"], [[5, 5], 7099285, "#a600ff", "#f1faef"], [[5, 11], 15618427, "#7e00c2", "#f1faef"],
            [[6, 1], 24137569, "#ff9191", "#3d443c"], [[6, 3], 72412707, "#ff5d5d", "#3d443c"], [[6, 5], 120687845, "#ff0000", "#f1faef"], [[6, 11], 265513259, "#c50000", "#f1faef"],
            [[7, 1], 410338673, "#ffff7d", "#3d443c"], [[7, 3], 1231016019, "#ffff00", "#3d443c"], [[7, 5], 2051693365, "#d0d000", "#f1faef"], [[7, 11], 4513725403, "#989800", "#f1faef"],
            [["@This 1", "=", 1], [17, "^", "@This 0"], ["@HSLA", [53, "*", "@This 0", "-", 264], [0.9, "^", ["@This 0", "-", 7], "*", 100], 80, 1], "#3d443c"],
            [["@This 1", "=", 3], [17, "^", "@This 0", "*", 3], ["@HSLA", [53, "*", "@This 0", "-", 264], [0.9, "^", ["@This 0", "-", 7], "*", 100], 65, 1], "#3d443c"],
            [["@This 1", "=", 5], [17, "^", "@This 0", "*", 5], ["@HSLA", [53, "*", "@This 0", "-", 264], [0.9, "^", ["@This 0", "-", 7], "*", 100], 50, 1], "#f1faef"],
            [["@This 1", "=", 11], [17, "^", "@This 0", "*", 11], ["@HSLA", [53, "*", "@This 0", "-", 264], [0.9, "^", ["@This 0", "-", 7], "*", 100], 35, 1], "#f1faef"],
        ]
        MergeRules = [
            [3, [["@Next 1 0", "=", "@This 0"], "&&", ["@Next 2 0", "=", "@This 0"], "&&", ["@Next 2 1", "=", 1], "&&", ["@Next 1 1", "=", 1], "&&", ["@This 1", "=", 1]], true, [["@This 0", 3]], [17, "^", "@This 0", "*", 3], [false, true, true]],
            [3, [["@Next 1 0", "=", "@This 0"], "&&", ["@Next 2 0", "=", "@This 0"], "&&", ["@Next 2 1", "=", 3], "&&", ["@Next 1 1", "=", 1], "&&", ["@This 1", "=", 1]], false, [["@This 0", 5]], [17, "^", "@This 0", "*", 5], [false, true, true]],
            [3, [["@Next 1 0", "=", "@This 0"], "&&", ["@Next 2 0", "=", "@This 0"], "&&", ["@Next 2 1", "=", 5], "&&", ["@Next 1 1", "=", 5], "&&", ["@This 1", "=", 1]], false, [["@This 0", 11]], [17, "^", "@This 0", "*", 11], [false, true, true]],
            [3, [["@Next 1 0", "=", "@This 0"], "&&", ["@Next 2 0", "=", "@This 0"], "&&", ["@Next 2 1", "=", 11], "&&", ["@Next 1 1", "=", 5], "&&", ["@This 1", "=", 1]], false, [[["@This 0", "+", 1], 1]], [17, "^", "@This 0", "*", 17], [false, true, true]],
        ]
        startTileSpawns = [[[0, 1], 90], [[0, 3], 7], [[0, 5], 3]];
        winConditions = [[3, 1]];
        winRequirement = 1;
        document.documentElement.style.setProperty("background-image", "radial-gradient(#88ff88 0%, #fff 150%)");
        document.documentElement.style.setProperty("--background-color", "#eaffe5");
        document.documentElement.style.setProperty("--grid-color", "#b3e0b2");
        document.documentElement.style.setProperty("--tile-color", "#c3f6b8");
        document.documentElement.style.setProperty("--text-color", "#6f796d");
        displayRules("rules_text", ["h2", "Powers of 17"], ["h1", "4913"], ["p","  Merges can occur between three tiles that are both the same number and a power of 17, between two tiles that are the same power of 17 and one tile that's triple that power of 17, between one tile that's a power of 17 and two tiles that are quintuple that power of 17, or between one tile that's a power of 17, one tile that's quintuple that power of 17, and one tile that's 11 times that power of 17. Get to the 4913 tile to win!"],
        ["p", "Spawning tiles: 1 (90%), 3 (7%), 5 (3%)"]);
        displayRules("gm_rules_text", ["h2", "Powers of 17"], ["h1", "4913"], ["p","  Merges can occur between three tiles that are both the same number and a power of 17, between two tiles that are the same power of 17 and one tile that's triple that power of 17, between one tile that's a power of 17 and two tiles that are quintuple that power of 17, or between one tile that's a power of 17, one tile that's quintuple that power of 17, and one tile that's 11 times that power of 17. Get to the 4913 tile to win!"],
        ["p", "Spawning tiles: 1 (90%), 3 (7%), 5 (3%)"]);
    }
    else if (mode == 19) { // 8000
        width = 5; height = 5; min_dim = 3;
        TileNumAmount = 2;
        TileTypes = [
            [[0, 1], 1, "#460046", "#dcd9ec"], [[0, 2], 2, "#7e007e", "#dcd9ec"], [[0, 6], 6, "#bd00bd", "#dcd9ec"], [[0, 12], 12, "#ff00ff", "#dcd9ec"],
            [[1, 1], 20, "#462000", "#dcd9ec"], [[1, 2], 40, "#7d3800", "#dcd9ec"], [[1, 6], 120, "#b55100", "#dcd9ec"], [[1, 12], 240, "#ff7300", "#dcd9ec"],
            [[2, 1], 400, "#005800", "#dcd9ec"], [[2, 2], 800, "#008000", "#dcd9ec"], [[2, 6], 2400, "#00b300", "#dcd9ec"], [[2, 12], 4800, "#00df00", "#dcd9ec"],
            [[3, 1], 8000, "#000049", "#dcd9ec"], [[3, 2], 16000, "#00007d", "#dcd9ec"], [[3, 6], 48000, "#0000ba", "#dcd9ec"], [[3, 12], 96000, "#0000ff", "#dcd9ec"],
            [[4, 1], 160000, "#460000", "#dcd9ec"], [[4, 2], 320000, "#720000", "#dcd9ec"], [[4, 6], 960000, "#b60000", "#dcd9ec"], [[4, 12], 1920000, "#ff0000", "#dcd9ec"],
            [[5, 1], 3200000, "#5c5000", "#dcd9ec"], [[5, 2], 6400000, "#917e00", "#dcd9ec"], [[5, 6], 19200000, "#c8ad00", "#dcd9ec"], [[5, 12], 38400000, "#ffdd00", "#dcd9ec"],
            [["@This 1", "=", 1], [20, "^", "@This 0"], ["@HSVA", [82, "*", "@This 0", "-", 307], [0.9, "^", ["@This 0", "-", 6], "*", 100], 25, 1], "#dcd9ec"],
            [["@This 1", "=", 2], [20, "^", "@This 0", "*", 2], ["@HSVA", [82, "*", "@This 0", "-", 307], [0.9, "^", ["@This 0", "-", 6], "*", 100], 50, 1], "#dcd9ec"],
            [["@This 1", "=", 6], [20, "^", "@This 0", "*", 6], ["@HSVA", [82, "*", "@This 0", "-", 307], [0.9, "^", ["@This 0", "-", 6], "*", 100], 75, 1], "#2d2b39"],
            [["@This 1", "=", 12], [20, "^", "@This 0", "*", 12], ["@HSVA", [82, "*", "@This 0", "-", 307], [0.9, "^", ["@This 0", "-", 6], "*", 100], 100, 1], "#2d2b39"],
        ]
        MergeRules = [
            [2, [["@Next 1 0", "=", "@This 0"], "&&", ["@Next 1 1", "=", "@This 1"], "&&", [["@This 1", "=", 1], "||", ["@This 1", "=", 6]]], true, [["@This 0", ["@This 1", "*", 2]]], [20, "^", "@This 0", "*", "@This 1", "*", 2], [false, true]],
            [3, [["@Next 1 0", "=", "@This 0"], "&&", ["@Next 2 0", "=", "@This 0"], "&&", ["@Next 2 1", "=", 2], "&&",  ["@Next 1 1", "=", 2], "&&", ["@This 1", "=", 2]], true, [["@This 0", 6]], [20, "^", "@This 0", "*", 6], [false, true, true]],
            [3, [["@Next 1 0", "=", "@This 0"], "&&", ["@Next 2 0", "=", "@This 0"], "&&", ["@Next 2 1", "=", 12], "&&",  ["@Next 1 1", "=", 6], "&&", ["@This 1", "=", 2]], false, [[["@This 0", "+", 1], 1]], [20, "^", "@This 0", "*", 20], [false, true, true]]
        ]
        startTileSpawns = [[[0, 1], 90], [[0, 2], 9], [[0, 6], 1]];
        winConditions = [[3, 1]];
        winRequirement = 1;
        document.documentElement.style.setProperty("background-image", "radial-gradient(#0000a8 0%, #fff 150%)");
        document.documentElement.style.setProperty("--background-color", "#b4afe0");
        document.documentElement.style.setProperty("--grid-color", "#767593");
        document.documentElement.style.setProperty("--tile-color", "#5c5a8f");
        document.documentElement.style.setProperty("--text-color", "#2d2b39");
        displayRules("rules_text", ["h2", "Powers of 20"], ["h1", "8000"], ["p","Merges occur between two equal tiles that are a power of 20 or sextuple a power of 20, between three equal tiles that are double a power of 20, or between a tile that's double a power of 20, a tile that's sextuple that power of 20, and a tile that's 12 times that power of 20. Get to the 8000 tile to win!"],
        ["p", "Spawning tiles: 1 (90%), 2 (9%), 6 (1%)"]);
        displayRules("gm_rules_text", ["h2", "Powers of 20"], ["h1", "8000"], ["p","Merges occur between two equal tiles that are a power of 20 or sextuple a power of 20, between three equal tiles that are double a power of 20, or between a tile that's double a power of 20, a tile that's sextuple that power of 20, and a tile that's 12 times that power of 20. Get to the 8000 tile to win!"],
        ["p", "Spawning tiles: 1 (90%), 2 (9%), 6 (1%)"]);
    }
    else if (mode == 20) { // 9261
        width = 5; height = 5; min_dim = 3;
        TileNumAmount = 2;
        TileTypes = [
            [[0, 1], 1, "#aaffaa", "#554051"], [[0, 3], 3, "#72ff72", "#554051"], [[0, 6], 6, "#00ff00", "#554051"],
            [[0, 10], 10, "#88ff00", "#7e277e"], [[0, 15], 15, "#00ff95", "#277e7e"],
            [[1, 1], 21, "#ffffc4", "#554051"], [[1, 3], 63, "#ffff80", "#554051"], [[1, 6], 126, "#ffff00", "#554051"],
            [[1, 10], 210, "#ffe000", "#7e277e"], [[1, 15], 315, "#d4ff00", "#277e7e"],
            [[2, 1], 441, "#a3eaff", "#554051"], [[2, 3], 1323, "#6bddff", "#554051"], [[2, 6], 2646, "#00c3ff", "#554051"],
            [[2, 10], 4410, "#00eeff", "#7e277e"], [[2, 15], 6615, "#00aaff", "#277e7e"],
            [[3, 1], 9261, "#ffa4ff", "#554051"], [[3, 3], 27783, "#ff72ff", "#554051"], [[3, 6], 55566, "#ff00ff", "#554051"],
            [[3, 10], 92610, "#d900ff", "#7e277e"], [[3, 15], 138915, "#ff00c8", "#277e7e"],
            [[4, 1], 194481, "#ff9696", "#554051"], [[4, 3], 583443, "#ff6363", "#554051"], [[4, 6], 1166886, "#ff0000", "#554051"],
            [[4, 10], 1944810, "#ff006f", "#7e277e"], [[4, 15], 2917215, "#ff4800", "#277e7e"],
            [[5, 1], 4084101, "#a1a1ff", "#554051"], [[5, 3], 12252303, "#6767ff", "#554051"], [[5, 6], 24504606, "#0000ff", "#554051"],
            [[5, 10], 40841010, "#0066ff", "#7e277e"], [[5, 15], 61261515, "#7b00ff", "#277e7e"],
            [["@This 1", "=", 1], [21, "^", "@This 0"], ["@HSVA", [113, "*", "@This 0", "-", 648], 33, [0.9, "^", ["@This 0", "-", 5], "*", 100], 1], "#f3e7f1"],
            [["@This 1", "=", 3], [21, "^", "@This 0", "*", 3], ["@HSVA", [113, "*", "@This 0", "-", 648], 66, [0.9, "^", ["@This 0", "-", 5], "*", 100], 1], "#f3e7f1"],
            [["@This 1", "=", 6], [21, "^", "@This 0", "*", 6], ["@HSVA", [113, "*", "@This 0", "-", 648], 100, [0.9, "^", ["@This 0", "-", 5], "*", 100], 1], "#f3e7f1"],
            [["@This 1", "=", 10], [21, "^", "@This 0", "*", 10], ["@HSVA", [113, "*", "@This 0", "-", 668], 100, [0.9, "^", ["@This 0", "-", 5], "*", 100], 1], "#ffbbff"],
            [["@This 1", "=", 15], [21, "^", "@This 0", "*", 15], ["@HSVA", [113, "*", "@This 0", "-", 628], 100, [0.9, "^", ["@This 0", "-", 5], "*", 100], 1], "#bbffff"],
        ];
        MergeRules = [
            [3, [["@Next 1 0", "=", "@This 0"], "&&", ["@Next 2 0", "=", "@This 0"], "&&", [["@This 1", "+", "@Next 1 1", "+", "@Next 2 1"], "@end_vars", ["@var_retain", "@Var 0", "=", 3], "||", ["@var_retain", "@Var 0", "=", 6], "||", ["@var_retain", "@Var 0", "=", 10], "||", ["@var_retain", "@Var 0", "=", 15]]], true, [["@This 0", ["@This 1", "+", "@Next 1 1", "+", "@Next 2 1"]]], [21, "^", "@This 0", "*", ["@This 1", "+", "@Next 1 1", "+", "@Next 2 1"]], [false, true, true]],
            [3, [["@Next 1 0", "=", "@This 0"], "&&", ["@Next 2 0", "=", "@This 0"], "&&", [["@This 1", "+", "@Next 1 1", "+", "@Next 2 1"], "@end_vars", ["@var_retain", "@Var 0", "=", 21]]], true, [[["@This 0", "+", 1], 1]], [21, "^", "@This 0", "*", 21], [false, true, true]],
            [2, [["@Next 1 0", "=", "@This 0"], "&&", [["@This 1", "+", "@Next 1 1"], "@end_vars", ["@var_retain", "@Var 0", "=", 3], "||", ["@var_retain", "@Var 0", "=", 6], "||", ["@var_retain", "@Var 0", "=", 10], "||", ["@var_retain", "@Var 0", "=", 15]], "&&", [[["@Next 1 0", "=", "@This 0"], "&&", ["@NextNE -1 0", "=", "@This 0"], "&&", [["@This 1", "+", "@Next 1 1", "+", "@NextNE -1 1"], "@end_vars", ["@var_retain", "@Var 0", "=", 3], "||", ["@var_retain", "@Var 0", "=", 6], "||", ["@var_retain", "@Var 0", "=", 10], "||", ["@var_retain", "@Var 0", "=", 15], "||", ["@var_retain", "@Var 0", "=", 21]]], "!"]], true, [["@This 0", ["@This 1", "+", "@Next 1 1"]]], [21, "^", "@This 0", "*", ["@This 1", "+", "@Next 1 1"]], [false, true]],
            [2, [["@Next 1 0", "=", "@This 0"], "&&", [["@This 1", "+", "@Next 1 1"], "@end_vars", ["@var_retain", "@Var 0", "=", 21]], "&&", [[["@Next 1 0", "=", "@This 0"], "&&", ["@NextNE -1 0", "=", "@This 0"], "&&", [["@This 1", "+", "@Next 1 1", "+", "@NextNE -1 1"], "@end_vars", ["@var_retain", "@Var 0", "=", 3], "||", ["@var_retain", "@Var 0", "=", 6], "||", ["@var_retain", "@Var 0", "=", 10], "||", ["@var_retain", "@Var 0", "=", 15], "||", ["@var_retain", "@Var 0", "=", 21]]], "!"]], true, [[["@This 0", "+", 1], 1]], [21, "^", "@This 0", "*", 21], [false, true]]
        ]
        startTileSpawns = [[[0, 1], 95], [[0, 3], 4], [[0, 6], 1]];
        winConditions = [[3, 1]];
        winRequirement = 1;
        document.documentElement.style.setProperty("background-image", "radial-gradient(#ff8cf5 0%, #fff 150%)");
        document.documentElement.style.setProperty("--background-color", "#fff0fd");
        document.documentElement.style.setProperty("--grid-color", "#ecc7e9");
        document.documentElement.style.setProperty("--tile-color", "#eaa4e4");
        document.documentElement.style.setProperty("--text-color", "#554051");
        displayRules("rules_text", ["h2", "Powers of 21"], ["h1", "9261"], ["p","Merges occur between any two or three tiles that add to a power of 21, triple a power of 21, sextuple a power of 21, 10 times a power of 21, or 15 times a power of 21. Get to the 9261 tile to win!"],
        ["p", "Spawning tiles: 1 (95%), 3 (4%), 6 (1%)"]);
        displayRules("gm_rules_text", ["h2", "Powers of 21"], ["h1", "9261"], ["p","Merges occur between any two or three tiles that add to a power of 21, triple a power of 21, sextuple a power of 21, 10 times a power of 21, or 15 times a power of 21. Get to the 9261 tile to win!"],
        ["p", "Spawning tiles: 1 (95%), 3 (4%), 6 (1%)"]);
    }
    else if (mode == 21) { // 625
        width = 5; height = 5; min_dim = 3;
        TileNumAmount = 2;
        TileTypes = [
            [[0, 0], 1, "#ff8c00", "#515a5a"], [[0, 1], 2, "#c76d00", "#eef9f9"], [[0, 2], 4, "#904f00", "#eef9f9"], [[0, 3], 8, "#633700", "#eef9f9"],
                [[0, 4], 16, "#402300", "#eef9f9"], [[0, -1], 3, "#ffaf4e", "#323939"], [[0, -2], 9, "#ffce93", "#323939"],
            [[1, 0], 25, "#d000ff", "#515a5a"], [[1, 1], 50, "#9f00c3", "#eef9f9"], [[1, 2], 100, "#780093", "#eef9f9"], [[1, 3], 200, "#480058", "#eef9f9"],
                [[1, 4], 400, "#30003a", "#eef9f9"], [[1, -1], 75, "#e260ff", "#323939"], [[1, -2], 225, "#eea1ff", "#323939"],
            [[2, 0], 625, "#00ccff", "#515a5a"], [[2, 1], 1250, "#00a9d3", "#eef9f9"], [[2, 2], 2500, "#007b9a", "#eef9f9"], [[2, 3], 5000, "#005469", "#eef9f9"],
                [[2, 4], 10000, "#003441", "#eef9f9"], [[2, -1], 1875, "#6ee2ff", "#323939"], [[2, -2], 5625, "#aeefff", "#323939"],
            [[3, 0], 15625, "#80ff00", "#515a5a"], [[3, 1], 31250, "#61c300", "#eef9f9"], [[3, 2], 62500, "#4a9400", "#eef9f9"], [[3, 3], 125000, "#316200", "#eef9f9"],
                [[3, 4], 250000, "#1d3900", "#eef9f9"], [[3, -1], 46875, "#aeff5d", "#323939"], [[3, -2], 140625, "#c8ff92", "#323939"],
            [[4, 0], 390625, "#ff006f", "#515a5a"], [[4, 1], 781250, "#c50055", "#eef9f9"], [[4, 2], 1562500, "#940040", "#eef9f9"], [[4, 3], 3125000, "#66002c", "#eef9f9"],
                [[4, 4], 6250000, "#3e001b", "#eef9f9"], [[4, -1], 1171875, "#ff519d", "#323939"], [[4, -2], 3515625, "#ff93c2", "#323939"],
            [["@This 1", "=", 0], [25, "^", "@This 0"], ["@HSLA", [-107, "*", "@This 0", "+", 775], [0.8, "^", ["@This 0", "-", 5], "*", 100], 50, 1], "#515a5a"],
            [["@This 1", "=", 1], [25, "^", "@This 0", "*", 2], ["@HSLA", [-107, "*", "@This 0", "+", 775], [0.8, "^", ["@This 0", "-", 5], "*", 100], 40, 1], "#eef9f9"],
            [["@This 1", "=", 2], [25, "^", "@This 0", "*", 4], ["@HSLA", [-107, "*", "@This 0", "+", 775], [0.8, "^", ["@This 0", "-", 5], "*", 100], 30, 1], "#eef9f9"],
            [["@This 1", "=", 3], [25, "^", "@This 0", "*", 8], ["@HSLA", [-107, "*", "@This 0", "+", 775], [0.8, "^", ["@This 0", "-", 5], "*", 100], 20, 1], "#eef9f9"],
            [["@This 1", "=", 4], [25, "^", "@This 0", "*", 16], ["@HSLA", [-107, "*", "@This 0", "+", 775], [0.8, "^", ["@This 0", "-", 5], "*", 100], 10, 1], "#eef9f9"],
            [["@This 1", "=", -1], [25, "^", "@This 0", "*", 3], ["@HSLA", [-107, "*", "@This 0", "+", 775], [0.8, "^", ["@This 0", "-", 5], "*", 100], 66, 1], "#323939"],
            [["@This 1", "=", -2], [25, "^", "@This 0", "*", 9], ["@HSLA", [-107, "*", "@This 0", "+", 775], [0.8, "^", ["@This 0", "-", 5], "*", 100], 83, 1], "#323939"],
        ]
        MergeRules = [
            [3, [["@Next 1 0", "=", "@This 0"], "&&", ["@Next 1 1", "=", "@This 1"], "&&", ["@Next 2 0", "=", "@This 0"], "&&", ["@Next 2 1", "=", "@This 1"], "&&", ["@This 1", "<=", 0], "&&", ["@This 1", ">", -2]], true, [["@This 0", ["@This 1", "-", 1]]], [25, "^", "@This 0", "*", [3, "^", ["@This 1", "*", -1], "*", 3]], [false, true, true]],
            [2, [["@NextNE -1 0", "!=", "@This 0"], "||", ["@NextNE -1 1", "!=", "@This 1"], "&&", ["@Next 1 0", "=", "@This 0"], "&&", ["@Next 1 1", "=", "@This 1"], "&&", ["@This 1", ">=", 0], "&&", ["@This 1", "<", 4]], true, [["@This 0", ["@This 1", "+", 1]]], [25, "^", "@This 0", "*", [2, "^", "@This 1", "*", 2]], [false, true]],
            [2, [["@Next 1 0", "=", "@This 0"], "&&", ["@This 1", "=", -2], "&&", ["@Next 1 1", "=", 4]], false, [[["@This 0", "+", 1], 0]], [25, "^", "@This 0", "*", 25], [false, true]],
        ]
        startTileSpawns = [[[0, 0], 90], [[0, 1], 5], [[0, -1], 5]];
        winConditions = [[2, 1]];
        winRequirement = 1;
        document.documentElement.style.setProperty("background-image", "radial-gradient(#007b7b 0%, #fff 150%)");
        document.documentElement.style.setProperty("--background-color", "#bbe1e0");
        document.documentElement.style.setProperty("--grid-color", "#789a9d");
        document.documentElement.style.setProperty("--tile-color", "#88c8ce");
        document.documentElement.style.setProperty("--text-color", "#323939");
        displayRules("rules_text", ["h2", "Powers of 25"], ["h1", "625"], ["p","Merges occur between two equal tiles that are a power of 25, double a power of 25, quadruple a power of 25, or 8 times a power of 25, between three equal tiles that are a power of 25 or triple a power of 25, or between a tile that's 9 times a power of 25 and a tile that's 16 times a power of 25. Get to the 625 tile to win!"],
        ["p", "Spawning tiles: 1 (90%), 2 (5%), 3 (5%)"]);
        displayRules("gm_rules_text", ["h2", "Powers of 25"], ["h1", "625"], ["p","Merges occur between two equal tiles that are a power of 25, double a power of 25, quadruple a power of 25, or 8 times a power of 25, between three equal tiles that are a power of 25 or triple a power of 25, or between a tile that's 9 times a power of 25 and a tile that's 16 times a power of 25. Get to the 625 tile to win!"],
        ["p", "Spawning tiles: 1 (90%), 2 (5%), 3 (5%)"]);
    }
    else if (mode == 22) { // 900
        width = 7; height = 7; min_dim = 5;
        TileNumAmount = 2;
        TileTypes = [
            [[0, 1], 1, "#000000", "#ffffff"], [[0, 2], 2, "radial-gradient(#000000 0% 33%, #f00)", "#ffffff"], [[0, 3], 3, "radial-gradient(#000000 0% 33%, #0f0)", "#ffffff"],
            [[0, 5], 5, "radial-gradient(#000000 0% 33%, #00f)", "#ffffff"], [[0, 6], 6, "radial-gradient(#000000 0% 33%, #ff0)", "#ffffff"],
            [[0, 10], 10, "radial-gradient(#000000 0% 33%, #f0f)", "#ffffff"], [[0, 15], 15, "radial-gradient(#000000 0% 33%, #0ff)", "#ffffff"],
            [[1, 1], 30, "#ffffff", "#000000"], [[1, 2], 60, "radial-gradient(#ffffff 0% 33%, #f00)", "#000000"], [[1, 3], 90, "radial-gradient(#ffffff 0% 33%, #0f0)", "#000000"],
            [[1, 5], 150, "radial-gradient(#ffffff 0% 33%, #00f)", "#000000"], [[1, 6], 180, "radial-gradient(#ffffff 0% 33%, #ff0)", "#000000"],
            [[1, 10], 300, "radial-gradient(#ffffff 0% 33%, #f0f)", "#000000"], [[1, 15], 450, "radial-gradient(#ffffff 0% 33%, #0ff)", "#000000"],
            [[2, 1], 900, "#97006c", "#ffffff"], [[2, 2], 1800, "radial-gradient(#97006c 0% 33%, #f00)", "#ffffff"], [[2, 3], 2700, "radial-gradient(#97006c 0% 33%, #0f0)", "#ffffff"],
            [[2, 5], 4500, "radial-gradient(#97006c 0% 33%, #00f)", "#ffffff"], [[2, 6], 5400, "radial-gradient(#97006c 0% 33%, #ff0)", "#ffffff"],
            [[2, 10], 9000, "radial-gradient(#97006c 0% 33%, #f0f)", "#ffffff"], [[2, 15], 13500, "radial-gradient(#97006c 0% 33%, #0ff)", "#ffffff"],
            [[3, 1], 27000, "#ffe788", "#000000"], [[3, 2], 54000, "radial-gradient(#ffe788 0% 33%, #f00)", "#000000"], [[3, 3], 81000, "radial-gradient(#ffe788 0% 33%, #0f0)", "#000000"],
            [[3, 5], 135000, "radial-gradient(#ffe788 0% 33%, #00f)", "#000000"], [[3, 6], 162000, "radial-gradient(#ffe788 0% 33%, #ff0)", "#000000"],
            [[3, 10], 270000, "radial-gradient(#ffe788 0% 33%, #f0f)", "#000000"], [[3, 15], 405000, "radial-gradient(#ffe788 0% 33%, #0ff)", "#000000"],
            [[4, 1], 810000, "#00306e", "#ffffff"], [[4, 2], 1620000, "radial-gradient(#00306e 0% 33%, #f00)", "#ffffff"], [[4, 3], 2430000, "radial-gradient(#00306e 0% 33%, #0f0)", "#ffffff"],
            [[4, 5], 4050000, "radial-gradient(#00306e 0% 33%, #00f)", "#ffffff"], [[4, 6], 4860000, "radial-gradient(#00306e 0% 33%, #ff0)", "#ffffff"],
            [[4, 10], 8100000, "radial-gradient(#00306e 0% 33%, #f0f)", "#ffffff"], [[4, 15], 12150000, "radial-gradient(#00306e 0% 33%, #0ff)", "#ffffff"],
            [[5, 1], 24300000, "#7affb6", "#000000"], [[5, 2], 48600000, "radial-gradient(#7affb6 0% 33%, #f00)", "#000000"], [[5, 3], 72900000, "radial-gradient(#7affb6 0% 33%, #0f0)", "#000000"],
            [[5, 5], 121500000, "radial-gradient(#7affb6 0% 33%, #00f)", "#000000"], [[5, 6], 145800000, "radial-gradient(#7affb6 0% 33%, #ff0)", "#000000"],
            [[5, 10], 243000000, "radial-gradient(#7affb6 0% 33%, #f0f)", "#000000"], [[5, 15], 364500000, "radial-gradient(#7affb6 0% 33%, #0ff)", "#000000"],
            [["@This 1", "=", 1], [30, "^", "@This 0"], ["@HSLA", [139, "*", "@This 0", "-", 804], [0.85, "^", ["@This 0", "-", 6], "*", 100], ["@This 0", "%", 2, "*", 50, "+", 25], 1], ["@HSLA", 0, 0, ["@This 0", "%", 2, "*", -100, "+", 100], 1]],
            [["@This 1", "=", 2], [30, "^", "@This 0", "*", 2], ["@radial-gradient", ["@HSLA", [139, "*", "@This 0", "-", 804], [0.85, "^", ["@This 0", "-", 6], "*", 100], ["@This 0", "%", 2, "*", 50, "+", 25], 1], 0, 25, "#f00"], ["@HSLA", 0, 0, ["@This 0", "%", 2, "*", -100, "+", 100], 1]],
            [["@This 1", "=", 3], [30, "^", "@This 0", "*", 3], ["@radial-gradient", ["@HSLA", [139, "*", "@This 0", "-", 804], [0.85, "^", ["@This 0", "-", 6], "*", 100], ["@This 0", "%", 2, "*", 50, "+", 25], 1], 0, 25, "#0f0"], ["@HSLA", 0, 0, ["@This 0", "%", 2, "*", -100, "+", 100], 1]],
            [["@This 1", "=", 5], [30, "^", "@This 0", "*", 5], ["@radial-gradient", ["@HSLA", [139, "*", "@This 0", "-", 804], [0.85, "^", ["@This 0", "-", 6], "*", 100], ["@This 0", "%", 2, "*", 50, "+", 25], 1], 0, 25, "#00f"], ["@HSLA", 0, 0, ["@This 0", "%", 2, "*", -100, "+", 100], 1]],
            [["@This 1", "=", 6], [30, "^", "@This 0", "*", 6], ["@radial-gradient", ["@HSLA", [139, "*", "@This 0", "-", 804], [0.85, "^", ["@This 0", "-", 6], "*", 100], ["@This 0", "%", 2, "*", 50, "+", 25], 1], 0, 25, "#ff0"], ["@HSLA", 0, 0, ["@This 0", "%", 2, "*", -100, "+", 100], 1]],
            [["@This 1", "=", 10], [30, "^", "@This 0", "*", 10], ["@radial-gradient", ["@HSLA", [139, "*", "@This 0", "-", 804], [0.85, "^", ["@This 0", "-", 6], "*", 100], ["@This 0", "%", 2, "*", 50, "+", 25], 1], 0, 25, "#f0f"], ["@HSLA", 0, 0, ["@This 0", "%", 2, "*", -100, "+", 100], 1]],
            [["@This 1", "=", 15], [30, "^", "@This 0", "*", 15], ["@radial-gradient", ["@HSLA", [139, "*", "@This 0", "-", 804], [0.85, "^", ["@This 0", "-", 6], "*", 100], ["@This 0", "%", 2, "*", 50, "+", 25], 1], 0, 25, "#0ff"], ["@HSLA", 0, 0, ["@This 0", "%", 2, "*", -100, "+", 100], 1]],
        ];
        MergeRules = [
            [5, [["@This 1", "=", 1], "||", ["@This 1", "=", 2], "||", ["@This 1", "=", 3], "&&", [["@NextNE -1 0", "!=", "@This 0"], "||", ["@NextNE -1 1", "!=", "@This 1"]], "&&", [["@Next 5 0", "!=", "@This 0"], "||", ["@Next 5 1", "!=", "@This 1"]], "&&", ["@Next 1 0", "=", "@This 0"], "&&", ["@Next 1 1", "=", "@This 1"], "&&", ["@Next 2 0", "=", "@This 0"], "&&", ["@Next 2 1", "=", "@This 1"], "&&", ["@Next 3 0", "=", "@This 0"], "&&", ["@Next 3 1", "=", "@This 1"], "&&", ["@Next 4 0", "=", "@This 0"], "&&", ["@Next 4 1", "=", "@This 1"]], true, [["@This 0", ["@This 1", "*", 5]]], [30, "^", "@This 0", "*", "@This 1", "*", 5], [false, true, true, true, true]],
            [3, [["@This 1", "=", 1], "||", ["@This 1", "=", 2], "||", ["@This 1", "=", 5], "&&", [["@NextNE -1 0", "!=", "@This 0"], "||", ["@NextNE -1 1", "!=", "@This 1"]], "&&", [["@Next 3 0", "!=", "@This 0"], "||", ["@Next 3 1", "!=", "@This 1"]], "&&", ["@Next 1 0", "=", "@This 0"], "&&", ["@Next 1 1", "=", "@This 1"], "&&", ["@Next 2 0", "=", "@This 0"], "&&", ["@Next 2 1", "=", "@This 1"]], true, [["@This 0", ["@This 1", "*", 3]]], [30, "^", "@This 0", "*", "@This 1", "*", 3], [false, true, true]],
            [2, [["@This 1", "=", 1], "||", ["@This 1", "=", 3], "||", ["@This 1", "=", 5], "&&", [["@NextNE -1 0", "!=", "@This 0"], "||", ["@NextNE -1 1", "!=", "@This 1"]], "&&", [["@Next 2 0", "!=", "@This 0"], "||", ["@Next 2 1", "!=", "@This 1"]], "&&", ["@Next 1 0", "=", "@This 0"], "&&", ["@Next 1 1", "=", "@This 1"]], true, [["@This 0", ["@This 1", "*", 2]]], [30, "^", "@This 0", "*", "@This 1", "*", 2], [false, true]],
            [5, [["@This 1", "=", 6], "&&", [["@NextNE -1 0", "!=", "@This 0"], "||", ["@NextNE -1 1", "!=", "@This 1"]], "&&", [["@Next 5 0", "!=", "@This 0"], "||", ["@Next 5 1", "!=", "@This 1"]], "&&", ["@Next 1 0", "=", "@This 0"], "&&", ["@Next 1 1", "=", "@This 1"], "&&", ["@Next 2 0", "=", "@This 0"], "&&", ["@Next 2 1", "=", "@This 1"], "&&", ["@Next 3 0", "=", "@This 0"], "&&", ["@Next 3 1", "=", "@This 1"], "&&", ["@Next 4 0", "=", "@This 0"], "&&", ["@Next 4 1", "=", "@This 1"]], true, [[["@This 0", "+", 1], 1]], [30, "^", "@This 0", "*", "@This 1", "*", 30], [false, true, true, true, true]],
            [3, [["@This 1", "=", 10], "&&", [["@NextNE -1 0", "!=", "@This 0"], "||", ["@NextNE -1 1", "!=", "@This 1"]], "&&", [["@Next 3 0", "!=", "@This 0"], "||", ["@Next 3 1", "!=", "@This 1"]], "&&", ["@Next 1 0", "=", "@This 0"], "&&", ["@Next 1 1", "=", "@This 1"], "&&", ["@Next 2 0", "=", "@This 0"], "&&", ["@Next 2 1", "=", "@This 1"]], true, [[["@This 0", "+", 1], 1]], [30, "^", "@This 0", "*", "@This 1", "*", 30], [false, true, true]],
            [2, [["@This 1", "=", 15], "&&", [["@NextNE -1 0", "!=", "@This 0"], "||", ["@NextNE -1 1", "!=", "@This 1"]], "&&", [["@Next 2 0", "!=", "@This 0"], "||", ["@Next 2 1", "!=", "@This 1"]], "&&", ["@Next 1 0", "=", "@This 0"], "&&", ["@Next 1 1", "=", "@This 1"]], true, [[["@This 0", "+", 1], 1]], [30, "^", "@This 0", "*", "@This 1", "*", 30], [false, true]]
        ];
        startTileSpawns = [[[0, 1], 100]];
        winConditions = [[2, 1]];
        winRequirement = 1;
        document.documentElement.style.setProperty("background-image", "radial-gradient(#acacac 0%, #fff 100%)");
        document.documentElement.style.setProperty("--background-color", "#ffffff");
        document.documentElement.style.setProperty("--grid-color", "#a8a8a8");
        document.documentElement.style.setProperty("--tile-color", "#cbcbcb");
        document.documentElement.style.setProperty("--text-color", "#484848");
        displayRules("rules_text", ["h2", "Powers of 30"], ["h1", "900"], ["p", "Merges occur between two equal tiles that are equal to, triple, quintuple, or 15 times a power of 30, between three equal tiles that are equal to, double, quintuple, or 10 times a power of 30, or between five equal tiles that are equal to, double, triple, or sextuple a power of 30. A line of four, six, seven, etc. of the same tile will not merge. Get to the 900 tile to win!"],
        ["p", "Spawning tiles: 1 (100%)"]);
        displayRules("gm_rules_text", ["h2", "Powers of 30"], ["h1", "900"], ["p", "Merges occur between two equal tiles that are equal to, triple, quintuple, or 15 times a power of 30, between three equal tiles that are equal to, double, quintuple, or 10 times a power of 30, or between five equal tiles that are equal to, double, triple, or sextuple a power of 30. A line of four, six, seven, etc. of the same tile will not merge. Get to the 900 tile to win!"],
        ["p", "Spawning tiles: 1 (100%)"]);
    }
    else if (mode == 23) { // 2059
        width = 5; height = 5; min_dim = 3;
        TileNumAmount = 2;
        TileTypes = [
            [[1, 1], 1, "#ffffff", "#33312c"], [[1, 2], 2, "#808080", "#f9f5ee"], [[1, 3], 3, "#c4c4c4", "#33312c"],
            [[2, 1], 5, "#0066ff", "#33312c"], [[2, 2], 4, "#003c97", "#f9f5ee"], [[2, 3], 15, "#72aaff", "#33312c"],
            [[3, 1], 19, "#f200ff", "#33312c"], [[3, 2], 8, "#8a0091", "#f9f5ee"], [[3, 3], 57, "#f988ff", "#33312c"],
            [[4, 1], 65, "#a2ff00", "#33312c"], [[4, 2], 16, "#588a00", "#f9f5ee"], [[4, 3], 195, "#ceff79", "#33312c"],
            [[5, 1], 211, "#ff5100", "#33312c"], [[5, 2], 32, "#932e00", "#f9f5ee"], [[5, 3], 633, "#ff8f5b", "#33312c"],
            [[6, 1], 665, "#8c00ff", "#33312c"], [[6, 2], 64, "#4e008f", "#f9f5ee"], [[6, 3], 1995, "#bd6cff", "#33312c"],
            [[7, 1], 2059, "#ffcc00", "#33312c"], [[7, 2], 128, "#886d00", "#f9f5ee"], [[7, 3], 6177, "#ffe991", "#33312c"],
            [[8, 1], 6305, "#00ff04", "#33312c"], [[8, 2], 256, "#007a02", "#f9f5ee"], [[8, 3], 18915, "#96ff98", "#33312c"],
            [[9, 1], 19171, "#ff0099", "#33312c"], [[9, 2], 512, "#98005b", "#f9f5ee"], [[9, 3], 57513, "#ff88cf", "#33312c"],
            [[10, 1], 58025, "#00ffff", "#33312c"], [[10, 2], 1024, "#009191", "#f9f5ee"], [[10, 3], 174075, "#b2ffff", "#33312c"],
            [[11, 1], 175099, "#ffff00", "#33312c"], [[11, 2], 2048, "#797900", "#f9f5ee"], [[11, 3], 525297, "#ffff9f", "#33312c"],
            [[12, 1], 527345, "#00aaff", "#33312c"], [[12, 2], 4096, "#005681", "#f9f5ee"], [[12, 3], 1582035, "#87d7ff", "#33312c"],
            [["@This 1", "=", 1], [[3, "^", "@This 0"], "-", [2, "^", "@This 0"]], ["@HSLA", [157, "*", "@This 0", "-", 2041], [0.9, "^", ["@This 0", "-", 12], "*", 100], 50, 1], "#33312c"],
            [["@This 1", "=", 2], [2, "^", "@This 0"], ["@HSLA", [157, "*", "@This 0", "-", 2041], [0.9, "^", ["@This 0", "-", 12], "*", 100], 25, 1], "#f9f5ee"],
            [["@This 1", "=", 3], [[3, "^", "@This 0"], "-", [2, "^", "@This 0"], "*", 3], ["@HSLA", [157, "*", "@This 0", "-", 2041], [0.9, "^", ["@This 0", "-", 12], "*", 100], 75, 1], "#33312c"],
        ];
        MergeRules = [
            [2, [["@Next 1 0", "=", "@This 0"], "&&", ["@Next 1 1", "=", 2], "&&", ["@This 1", "=", 2]], true, [[["@This 0", "+", 1], 2]], [2, "^", "@This 0", "*", 2], [false, true]],
            [3, [["@Next 1 0", "=", "@This 0"], "&&", ["@Next 2 0", "=", "@This 0"], "&&", ["@Next 1 1", "=", 1], "&&", ["@This 1", "=", 1], "&&", ["@Next 2 1", "=", 1]], false, [["@This 0", 3]], [[3, "^", "@This 0"], "-", [2, "^", "@This 0"], "*", 3], [false, true, true]],
            [2, [["@Next 1 0", "=", "@This 0"], "&&", ["@Next 1 1", "=", 3], "&&", ["@This 1", "=", 2]], false, [[["@This 0", "+", 1], 1]], [[3, "^", ["@This 0", "+", 1]], "-", [2, "^", ["@This 0", "+", 1]]], [false, true]],
            [2, [["@NextNE -1 0", "!=", 1], "||", ["@NextNE -1 1", "!=", 1], "&&", ["@Next 1 0", "=", 1], "&&", ["@Next 1 1", "=", 1], "&&", ["@This 0", "=", 1], "&&", ["@This 1", "=", 1]], true, [[1, 2]], 2, [false, true]],
        ]
        startTileSpawns = [[[1, 1], 90], [[1, 2], 6], [[1, 3], 4]];
        winConditions = [[7, 1]];
        winRequirement = 1;
        document.documentElement.style.setProperty("background-image", "radial-gradient(#ffdf76 0%, #fff 150%)");
        document.documentElement.style.setProperty("--background-color", "#fffbde");
        document.documentElement.style.setProperty("--grid-color", "#efe1be");
        document.documentElement.style.setProperty("--tile-color", "#ddc994");
        document.documentElement.style.setProperty("--text-color", "#33312c");
        displayRules("rules_text", ["h2", "Powers of 3 Minus Powers of 2"], ["h1", "2059"], ["p","For any nonnegative integer n, merges can occur between two 2<sup>n</sup> tiles, between three (3<sup>n</sup> - 2<sup>n</sup>) tiles, or between one (3 * (3<sup>n</sup> - 2<sup>n</sup>)) tile and one 2<sup>n</sup> tile. Get to the 2059 (3<sup>7</sup> - 2<sup>7</sup>) tile to win! (Tip: 1 is both 2<sup>0</sup> and (3<sup>1</sup> - 2<sup>1</sup>), so two 1s and three 1s both have merges)"],
        ["p", "Spawning tiles: 1 (90%), 2 (6%), 3 (4%)"]);
        displayRules("gm_rules_text", ["h2", "Powers of 3 Minus Powers of 2"], ["h1", "2059"], ["p","For any nonnegative integer n, merges can occur between two 2<sup>n</sup> tiles, between three (3<sup>n</sup> - 2<sup>n</sup>) tiles, or between one (3 * (3<sup>n</sup> - 2<sup>n</sup>)) tile and one 2<sup>n</sup> tile. Get to the 2059 (3<sup>7</sup> - 2<sup>7</sup>) tile to win! (Tip: 1 is both 2<sup>0</sup> and (3<sup>1</sup> - 2<sup>1</sup>), so two 1s and three 1s both have merges)"],
        ["p", "Spawning tiles: 1 (90%), 2 (6%), 3 (4%)"]);
    }
    else if (mode == 24) { // 2315
        width = 5; height = 5; min_dim = 3;
        TileNumAmount = 2;
        TileTypes = [
            [[0, 1], 1, "#808080", "#d9e3f4"], [[0, 2], 2, "#dddddd", "#333943"],
            [[1, 1], 3, "#b28900", "#d9e3f4"], [[1, 2], 5, "#ffd54a", "#333943"],
            [[2, 1], 9, "#9500b2", "#d9e3f4"], [[2, 2], 13, "#e566ff", "#333943"],
            [[3, 1], 27, "#00bd65", "#d9e3f4"], [[3, 2], 35, "#64ffb7", "#333943"],
            [[4, 1], 81, "#b43000", "#d9e3f4"], [[4, 2], 97, "#ff6e39", "#333943"],
            [[5, 1], 243, "#00becc", "#d9e3f4"], [[5, 2], 275, "#50f3ff", "#333943"],
            [[6, 1], 729, "#c80099", "#d9e3f4"], [[6, 2], 793, "#ff42d3", "#333943"],
            [[7, 1], 2187, "#0080cb", "#d9e3f4"], [[7, 2], 2315, "#4cbdff", "#333943"],
            [[8, 1], 6561, "#6f00be", "#d9e3f4"], [[8, 2], 6817, "#b144ff", "#333943"],
            [[9, 1], 19683, "#bd5e00", "#d9e3f4"], [[9, 2], 20195, "#ff9e3d", "#333943"],
            [[10, 1], 59049, "#0045c4", "#d9e3f4"], [[10, 2], 60073, "#2c76ff", "#333943"],
            [[11, 1], 177147, "#67d500", "#d9e3f4"], [[11, 2], 179195, "#9fff46", "#333943"],
            [["@This 1", "=", 1], [3, "^", "@This 0"], ["@HSLA", [-149, "*", "@This 0", "+", 1788], [0.9, "^", ["@This 0", "-", 12], "*", 100], 35, 1], "#d9e3f4"],
            [["@This 1", "=", 2], [[3, "^", "@This 0"], "+", [2, "^", "@This 0"]], ["@HSLA", [-149, "*", "@This 0", "+", 1788], [0.9, "^", ["@This 0", "-", 12], "*", 100], 65, 1], "#333943"],
        ];
        MergeRules = [
            [3, [["@Next 1 0", "=", "@This 0"], "&&", ["@Next 2 0", "=", "@This 0"], "&&", ["@Next 1 1", "=", 1], "&&", ["@This 1", "=", 1], "&&", ["@Next 2 1", "=", 1]], false, [[["@This 0", "+", 1], 1]], [3, "^", "@This 0"], [false, true, true]],
            [3, [["@Next 1 0", "=", "@This 0"], "&&", ["@Next 2 0", "=", "@This 0"], "&&", ["@Next 1 1", "=", 2], "&&", ["@This 1", "=", 2], "&&", ["@Next 2 1", "=", 1]], false, [[["@This 0", "+", 1], 2]], [[3, "^", ["@This 0", "+", 1]], "*", [2, "^", ["@This 0", "+", 1]]], [false, true, true]],
            [2, [["@NextNE -1 0", "!=", 0], "||", ["@NextNE -1 1", "!=", 1], "&&", ["@Next 1 0", "=", 0], "&&", ["@Next 1 1", "=", 1], "&&", ["@This 0", "=", 0], "&&", ["@This 1", "=", 1]], true, [[0, 2]], 2, [false, true]]
        ]
        startTileSpawns = [[[0, 1], 90], [[0, 2], 6], [[1, 1], 4]];
        winConditions = [[7, 2]];
        winRequirement = 1;
        document.documentElement.style.setProperty("background-image", "radial-gradient(#829bff 0%, #fff 150%)");
        document.documentElement.style.setProperty("--background-color", "#dae5ff");
        document.documentElement.style.setProperty("--grid-color", "#b1c4e0");
        document.documentElement.style.setProperty("--tile-color", "#bad3fa");
        document.documentElement.style.setProperty("--text-color", "#333943");
        displayRules("rules_text", ["h2", "Powers of 3 Plus Powers of 2"], ["h1", "2315"], ["p", "Two or three 1s can merge, and for any nonnegative integer n, merges can occur between three 3<sup>n</sup> tiles, or between two (3<sup>n</sup> + 2<sup>n</sup>) tiles and one 3<sup>n</sup> tile. Get to the 2315 (3<sup>7</sup> + 2<sup>7</sup>) tile to win!"],
        ["p", "Spawning tiles: 1 (90%), 2 (6%), 3 (4%)"]);
        displayRules("gm_rules_text", ["h2", "Powers of 3 Plus Powers of 2"], ["h1", "2315"], ["p", "Two or three 1s can merge, and for any nonnegative integer n, merges can occur between three 3<sup>n</sup> tiles, or between two (3<sup>n</sup> + 2<sup>n</sup>) tiles and one 3<sup>n</sup> tile. Get to the 2315 (3<sup>7</sup> + 2<sup>7</sup>) tile to win!"],
        ["p", "Spawning tiles: 1 (90%), 2 (6%), 3 (4%)"]);
    }
    else if (mode == 25) { // XXXX
        width = 6; height = 6; min_dim = 3;
        TileNumAmount = 2;
        TileTypes = [[[1, 0], 1, "#ffffff", "#000000"],
        [[["@This 0", ">", 1], "&&", ["@This 1", "<", 5]], ["@This 0", "^", "@This 1"], ["@HSLA", [222.49223595, "*", "@This 0", "-", 444.9844719], 100, [100, "-", ["@This 1", "*", 12.5]], 1], "#000000"],
        [true, ["@This 0", "^", "@This 1"], ["@HSLA", [222.49223595, "*", "@This 0", "-", 444.9844719], 100, [0.85, "^", ["@This 1", "-", 5], "*", 50], 1], "#ffffff"],];
        MergeRules = [
            [2, [["@NextNE -1 0", "!=", "@This 0"], "&&", ["@Next 1 0", "=", 1], "&&", ["@This 0", "=", 1]], true, [["@MLength", 1]], ["@MLength"], [], 2, [0, 1], 1, Math.max(width, height)],
            [Math.max(width, height), [["@Next 1 0", "=", 1], "&&", ["@This 0", "=", 1]], true, [["@MLength", 1]], ["@MLength"], [], 2, [0, 1], 1, Math.max(width, height)],
            ["@This 0", [["@Next 1 0", "=", "@This 0"], "&&", ["@Next 1 1", "=", "@This 1"], "&&", ["@This 0", ">", 1]], true, [["@This 0", ["@This 1", "+", 1]]], ["@This 0", "^", ["@This 1", "+", 1]], [], 2, [0, 1], 1],
        ];
        startTileSpawns = [[[1, 0], 100]];
        winConditions = [[["@This 0", "^", "@This 1", ">=", 1000]]]; // Any tile that's at least 1000 is winning
        winRequirement = 4;
        mode_vars = [2, Infinity]; //Minimum and maximum merge lengths; there's some special behavior if these are equal
        document.documentElement.style.setProperty("background-image", "radial-gradient(#636363 0%, #fff 150%)");
        document.documentElement.style.setProperty("--background-color", "#e8e8e8");
        document.documentElement.style.setProperty("--grid-color", "#e1c3c3");
        document.documentElement.style.setProperty("--tile-color", "#c6c3e1");
        document.documentElement.style.setProperty("--text-color", "#41433f");
        displayRules("rules_text", ["h2", "Powers of n"], ["h1", "XXXX"], ["p", "Any number of 1s can merge, but upon doing so, they merge into a tile that must merge with the same number of itself on each higher tier: for example, merging two 1s makes a 2, then it takes two 2s to merge, then two of those 4s, and so on, but merging three 1s makes a 3, then it takes three 3s to merge, then three of those 9s, and so on. To win, you must make at least four different tiles that have at least four digits. Sure, you could just win with 1024, 2048, 4096, and 8192, but where's the fun in that? How many different tiles can you discover?"],
        ["p", "Spawning tiles: 1 (100%)"]);
        displayRules("gm_rules_text", ["h2", "Powers of n"], ["h1", "XXXX"], ["p", "Any number of 1s can merge, but upon doing so, they merge into a tile that must merge with the same number of itself on each higher tier: for example, merging two 1s makes a 2, then it takes two 2s to merge, then two of those 4s, and so on, but merging three 1s makes a 3, then it takes three 3s to merge, then three of those 9s, and so on. To win, you must make at least four different tiles that have at least four digits. Sure, you could just win with 1024, 2048, 4096, and 8192, but where's the fun in that? How many different tiles can you discover?"],
        ["p", "Spawning tiles: 1 (100%)"]);
        statBoxes = [["Discovered Tiles", ["@DiscTiles", "arr_length"]], ["Score", "@Score"], ["Discovered Winning Tiles", ["@DiscWinning", "arr_length"]]];
        document.getElementById("mode_vars_line").style.setProperty("display", "block");
        document.getElementById("XXXX_vars").style.setProperty("display", "flex");
    }
    else if (mode == 26) { // 2584
        width = 4; height = 4; min_dim = 2;
        TileNumAmount = 1;
        TileTypes = [[[0], 1, "#ffffff", "#2d2b31"], [[1], 2, "#b3ffe8", "#2d2b31"], [[2], 3, "#52ffcb", "#2d2b31"], [[3], 5, "#00ff99", "#2d2b31"],
        [[4], 8, "#00c777", "#2d2b31"], [[5], 13, "#008b53", "#2d2b31"], [[6], 21, "#008b00", "#2d2b31"], [[7], 34, "#00e200", "#2d2b31"],
        [[8], 55, "#4aff4a", "#2d2b31"], [[9], 89, "#94ff94", "#2d2b31"], [[10], 144, "#8ac4ff", "#dddbe1"], [[11], 233, "#50a8ff", "#dddbe1"],
        [[12], 377, "#0180ff", "#dddbe1"], [[13], 610, "#0055a9", "#dddbe1"], [[14], 987, "#0030a9", "#dddbe1"], [[15], 1597, "#2d0087", "#dddbe1"],
        [[16], 2584, "#1a004f", "#dddbe1"], [[17], 4181, "#3d004f", "#dddbe1"], [[18], 6765, "#750099", "#dddbe1"], [[19], 10946, "#c300ff", "#dddbe1"],
        [[20], 17711, "#d85aff", "#dddbe1"], [[21], 28657, "#e591ff", "#dddbe1"],
        [true, [[((1 + Math.sqrt(5))/2), "^", ["@This 0", "+", 2]], "-", [((1 + Math.sqrt(5))/-2), "^", ["@This 0", "*", -1, "-", 2]], "/", Math.sqrt(5), "round", 1], ["@HSLA", [6.5, "*", "@This 0", "+", 157], [0.99, "^", ["@This 0", "-", 22], "*", 100], ["@This 0", "-", 21, "%", 9, "*", -1, "+", 4, "abs", "*", 10, "+", 30], 1], "#2d2b31"]];
        MergeRules = [
            [2, [["@Next 1 0", "=", 0], "&&", ["@This 0", "=", 0]], true, [[1]], 2, [false, true]],
            [2, ["@This 0", "-", 1, "=", "@Next 1 0"], false, [[["@This 0", "+", 1]]], [[((1 + Math.sqrt(5))/2), "^", ["@This 0", "+", 3]], "-", [((1 + Math.sqrt(5))/-2), "^", ["@This 0", "*", -1, "-", 3]], "/", Math.sqrt(5), "round", 1], [false, true]]
        ];
        startTileSpawns = [[[0], 85], [[1], 10], [[2], 5]];
        winConditions = [[16]];
        winRequirement = 1;
        document.documentElement.style.setProperty("background-image", "radial-gradient(#6637a8 0%, #fff 150%)");
        document.documentElement.style.setProperty("--background-color", "#d4caec");
        document.documentElement.style.setProperty("--grid-color", "#645f71");
        document.documentElement.style.setProperty("--tile-color", "#9f94b4");
        document.documentElement.style.setProperty("--text-color", "#2d2b31");
        displayRules("rules_text", ["h2", "Fibonacci Sequence"], ["h1", "2584"], ["p", "Merges occur between two 1s or between any tile above 1 and the tile before it. Get to the 2584 tile to win!"],
        ["p", "Spawning tiles: 1 (85%), 2 (10%), 3 (5%)"]);
        displayRules("gm_rules_text", ["h2", "Fibonacci Sequence"], ["h1", "2584"], ["p", "Merges occur between two 1s or between any tile above 1 and the tile before it. Get to the 2584 tile to win!"],
        ["p", "Spawning tiles: 1 (85%), 2 (10%), 3 (5%)"]);
    }
    else if (mode == 27) { // 2745
        width = 4; height = 4; min_dim = 2;
        TileNumAmount = 1;
        TileTypes = [
            [[-1], 1, "#003655", "#ebd9cd"], [[0], 2, "#005b90", "#ebd9cd"], [[1], 3, "#0088d6", "#ebd9cd"], [[2], 4, "#00a2ff", "#796c64"],
            [[3], 6, "#61c5ff", "#796c64"], [[4], 9, "#a8dfff", "#796c64"], [[5], 13, "#d2eeff", "#796c64"],
            [[6], 19, "#004a00", "#ebd9cd"], [[7], 28, "#008000", "#ebd9cd"], [[8], 41, "#00c200", "#ebd9cd"], [[9], 60, "#00ff00", "#796c64"],
            [[10], 88, "#8aff8a", "#796c64"], [[11], 129, "#aeffae", "#796c64"], [[12], 189, "#d3ffd3", "#796c64"],
            [[13], 277, "#4f2900", "#ebd9cd"], [[14], 406, "#8d4900", "#ebd9cd"], [[15], 595, "#c26400", "#ebd9cd"], [[16], 872, "#ff8400", "#796c64"],
            [[17], 1278, "#ffb05c", "#796c64"], [[18], 1873, "#ffcb93", "#796c64"], [[19], 2745, "#ffdebc", "#796c64"],
            [[20], 4023, "#3f000d", "#ebd9cd"], [[21], 5896, "#6f0016", "#ebd9cd"], [[22], 8641, "#ab0022", "#ebd9cd"], [[23], 12664, "#ff0033", "#796c64"],
            [[24], 18560, "#ff4f72", "#796c64"], [[25], 27201, "#ff859e", "#796c64"], [[26], 39865, "#ffbac8", "#796c64"],
            [[27], 58425, "#2c003d", "#ebd9cd"], [[28], 85626, "#560079", "#ebd9cd"], [[29], 125491, "#8200b6", "#ebd9cd"], [[30], 183916, "#b700ff", "#796c64"],
            [[31], 269542, "#d365ff", "#796c64"], [[32], 395033, "#e39dff", "#796c64"], [[33], 578949, "#f1cfff", "#796c64"],
            [["@This 0", "+", 1, "%", 7, "=", 0], [2, "@repeat", "@This 0", "*", 1.46557123187676802666, "round", 1, "@end-repeat"], ["@HSLA", ["@This 0", "+", 1, "floor", 7, "/", 7, "*", -79, "+", 635], [0.98, "^", ["@This 0", "-", 34], "*", 100], 12.5, 1], "#ebd9cd"],
            [["@This 0", "+", 1, "%", 7, "=", 1], [2, "@repeat", "@This 0", "*", 1.46557123187676802666, "round", 1, "@end-repeat"], ["@HSLA", ["@This 0", "+", 1, "floor", 7, "/", 7, "*", -79, "+", 635], [0.98, "^", ["@This 0", "-", 34], "*", 100], 25, 1], "#ebd9cd"],
            [["@This 0", "+", 1, "%", 7, "=", 2], [2, "@repeat", "@This 0", "*", 1.46557123187676802666, "round", 1, "@end-repeat"], ["@HSLA", ["@This 0", "+", 1, "floor", 7, "/", 7, "*", -79, "+", 635], [0.98, "^", ["@This 0", "-", 34], "*", 100], 37.5, 1], "#ebd9cd"],
            [["@This 0", "+", 1, "%", 7, "=", 3], [2, "@repeat", "@This 0", "*", 1.46557123187676802666, "round", 1, "@end-repeat"], ["@HSLA", ["@This 0", "+", 1, "floor", 7, "/", 7, "*", -79, "+", 635], [0.98, "^", ["@This 0", "-", 34], "*", 100], 50, 1], "#796c64"],
            [["@This 0", "+", 1, "%", 7, "=", 4], [2, "@repeat", "@This 0", "*", 1.46557123187676802666, "round", 1, "@end-repeat"], ["@HSLA", ["@This 0", "+", 1, "floor", 7, "/", 7, "*", -79, "+", 635], [0.98, "^", ["@This 0", "-", 34], "*", 100], 65, 1], "#796c64"],
            [["@This 0", "+", 1, "%", 7, "=", 5], [2, "@repeat", "@This 0", "*", 1.46557123187676802666, "round", 1, "@end-repeat"], ["@HSLA", ["@This 0", "+", 1, "floor", 7, "/", 7, "*", -79, "+", 635], [0.98, "^", ["@This 0", "-", 34], "*", 100], 80, 1], "#796c64"],
            [["@This 0", "+", 1, "%", 7, "=", 6], [2, "@repeat", "@This 0", "*", 1.46557123187676802666, "round", 1, "@end-repeat"], ["@HSLA", ["@This 0", "+", 1, "floor", 7, "/", 7, "*", -79, "+", 635], [0.98, "^", ["@This 0", "-", 34], "*", 100], 90, 1], "#796c64"],
        ];
        MergeRules = [
            [2, [["@Next 1 0", "=", -1], "&&", ["@This 0", "=", -1]], true, [[0]], 2, [false, true]],
            [2, [["@Next 1 0", "=", -1], "&&", ["@This 0", "=", 0]], false, [[1]], 3, [false, true]],
            [2, ["@This 0", "-", 2, "=", "@Next 1 0"], false, [[["@This 0", "+", 1]]], [2, "@repeat", "@This 0", "*", 1.46557123187676802666, "round", 1, "@end-repeat"], [false, true]]
        ];
        startTileSpawns = [[[-1], 85], [[0], 10], [[1], 5]];
        winConditions = [[19]];
        winRequirement = 1;
        document.documentElement.style.setProperty("background-image", "radial-gradient(#ffba7d 0%, #fff 150%)");
        document.documentElement.style.setProperty("--background-color", "#fff3e6");
        document.documentElement.style.setProperty("--grid-color", "#dbc2ad");
        document.documentElement.style.setProperty("--tile-color", "#f9e1ce");
        document.documentElement.style.setProperty("--text-color", "#796c64");
        displayRules("rules_text", ["h2", "Narayana's Cows Sequence"], ["h1", "2745"], ["p", "Merges occur between two 1s, between a 1 and a 2, or between any tile above 2 and the tile two tiles before it. Get to the 2745 tile to win!"],
        ["p", "Spawning tiles: 1 (85%), 2 (10%), 3 (5%)"]);
        displayRules("gm_rules_text", ["h2", "Narayana's Cows Sequence"], ["h1", "2745"], ["p", "Merges occur between two 1s, between a 1 and a 2, or between any tile above 2 and the tile two tiles before it. Get to the 2745 tile to win!"],
        ["p", "Spawning tiles: 1 (85%), 2 (10%), 3 (5%)"]);
    }
    else if (mode == 28) { // 1705
        width = 5; height = 5; min_dim = 3;
        TileNumAmount = 1;
        TileTypes = [[[0], 1, "#ffffff", "#2b352a"], [[1], 2, "#fff7c9", "#2b352a"], [[2], 4, "#fff098", "#2b352a"], [[3], 7, "#ffe75f", "#2b352a"],
        [[4], 13, "#ffdd1c", "#2b352a"], [[5], 24, "#cfb000", "#e5eee4"], [[6], 44, "#8e7900", "#e5eee4"], [[7], 81, "#aeffae", "#2b352a"],
        [[8], 149, "#65ff65", "#2b352a"], [[9], 274, "#00ff00", "#2b352a"], [[10], 504, "#00bc00", "#e5eee4"], [[11], 927, "#007d00", "#e5eee4"],
        [[12], 1705, "#005a00", "#e5eee4"], [[13], 3136, "#a6f5ff", "#2b352a"], [[14], 5768, "#60ecff", "#2b352a"], [[15], 10609, "#00d6f3", "#2b352a"],
        [[16], 19513, "#00b0c7", "#e5eee4"], [[17], 35890, "#008192", "#e5eee4"], [[18], 66012, "#004d57", "#e5eee4"],
        [["@This 0", "-", 1, "%", 6, "<", 3], [1, "@repeat", "@This 0", "*", 1.83928675521416113255, "round", 1, "@end-repeat"], ["@HSLA", ["@This 0", "-", 1, "floor", 6, "/", 6, "*", 79, "+", 33], [0.98, "^", ["@This 0", "-", 18], "*", 100], ["@This 0", "-", 1, "%", 6, "*", -15, "+", 80], 1], "#2b352a"],
        [["@This 0", "-", 1, "%", 6, ">=", 3], [1, "@repeat", "@This 0", "*", 1.83928675521416113255, "round", 1, "@end-repeat"], ["@HSLA", ["@This 0", "-", 1, "floor", 6, "/", 6, "*", 79, "+", 33], [0.98, "^", ["@This 0", "-", 18], "*", 100], ["@This 0", "-", 1, "%", 6, "*", -10, "+", 70], 1], "#e5eee4"]];
        MergeRules = [
            [3, [["@This 0", "-", 1, "=", "@Next 1 0"], "&&", ["@This 0", "-", 2, "=", "@Next 2 0"]], false, [[["@This 0", "+", 1]]], [1, "@repeat", ["@This 0", "+", 1], "*", 1.83928675521416113255, "round", 1, "@end-repeat"], [false, true, true]],
            [3, [["@Next 1 0", "=", 0], "&&", ["@This 0", "=", 0], "&&", ["@Next 2 0", "=", 1]], false, [[2]], 4, [false, true, true]],
            [2, [["@Next 1 0", "=", 0], "&&", ["@This 0", "=", 0], "&&", ["@NextNE -1 0", "!=", 1]], true, [[1]], 2, [false, true]],
        ];
        startTileSpawns = [[[0], 85], [[1], 12], [[2], 3]];
        winConditions = [[12]];
        winRequirement = 1;
        document.documentElement.style.setProperty("background-image", "radial-gradient(#009900 0%, #fff 150%)");
        document.documentElement.style.setProperty("--background-color", "#b5d4ae");
        document.documentElement.style.setProperty("--grid-color", "#7c8f79");
        document.documentElement.style.setProperty("--tile-color", "#a6c09f");
        document.documentElement.style.setProperty("--text-color", "#2b352a");
        displayRules("rules_text", ["h2", "Tribonacci Sequence"], ["h1", "1705"], ["p", "Merges occur between two 1s, between two 1s and a 2, or between any tile above 2, the tile before it, and the tile two before it. Get to the 1705 tile to win!"],
        ["p", "Spawning tiles: 1 (85%), 2 (12%), 4 (3%)"]);
        displayRules("gm_rules_text", ["h2", "Tribonacci Sequence"], ["h1", "1705"], ["p", "Merges occur between two 1s, between two 1s and a 2, or between any tile above 2, the tile before it, and the tile two before it. Get to the 1705 tile to win!"],
        ["p", "Spawning tiles: 1 (85%), 2 (12%), 4 (3%)"]);
    }
    else if (mode == 29) { // 1535, 1536, 1537
        width = 4; height = 4; min_dim = 2;
        TileNumAmount = 2;
        TileTypes = [
            [[0, -1], 2, "#ffffff", "#742020"], [[0, 0], 3, "#cecece", "#18571a"], [[0, 1], 4, "#919191", "#171a51"],
            [[1, -1], 5, "#c561ff", "#742020"], [[1, 0], 6, "#a200ff", "#18571a"], [[1, 1], 7, "#7500b9", "#171a51"],
            [[2, -1], 11, "#6c6cff", "#742020"], [[2, 0], 12, "#0000ff", "#18571a"], [[2, 1], 13, "#0000b4", "#171a51"],
            [[3, -1], 23, "#7bdaff", "#742020"], [[3, 0], 24, "#00b7ff", "#18571a"], [[3, 1], 25, "#0084b8", "#171a51"],
            [[4, -1], 47, "#9bffff", "#742020"], [[4, 0], 48, "#00ffff", "#18571a"], [[4, 1], 49, "#00cece", "#171a51"],
            [[5, -1], 95, "#6fffb2", "#742020"], [[5, 0], 96, "#00ff77", "#18571a"], [[5, 1], 97, "#00c35b", "#171a51"],
            [[6, -1], 191, "#c0ff74", "#742020"], [[6, 0], 192, "#8cff00", "#18571a"], [[6, 1], 193, "#69bf00", "#171a51"],
            [[7, -1], 383, "#ffff8b", "#742020"], [[7, 0], 384, "#ffff00", "#18571a"], [[7, 1], 385, "#d4d400", "#171a51"],
            [[8, -1], 767, "#ffe572", "#742020"], [[8, 0], 768, "#ffd000", "#18571a"], [[8, 1], 769, "#c09d00", "#171a51"],
            [[9, -1], 1535, "#ffb765", "#742020"], [[9, 0], 1536, "#ff8800", "#18571a"], [[9, 1], 1537, "#bd6500", "#171a51"],
            [[10, -1], 3071, "#ff7e65", "#742020"], [[10, 0], 3072, "#ff2a00", "#18571a"], [[10, 1], 3073, "#9a1a00", "#171a51"],
            [[11, -1], 6143, "#ff6dca", "#742020"], [[11, 0], 6144, "#ff00a2", "#18571a"], [[11, 1], 6145, "#a20067", "#171a51"],
            [[12, -1], 12287, "#f67dff", "#742020"], [[12, 0], 12288, "#ee00ff", "#18571a"], [[12, 1], 12289, "#82008b", "#171a51"],
            [["@This 1", "=", -1], [2, "^", "@This 0", "*", 3, "-", 1], ["@HSLA", [-29, "*", "@This 0", "+", 636], [0.95, "^", ["@This 0", "-", 13], "*", 65], 70, 1], "#742020"],
            [["@This 1", "=", 0], [2, "^", "@This 0", "*", 3], ["@HSLA", [-29, "*", "@This 0", "+", 636], [0.95, "^", ["@This 0", "-", 13], "*", 65], 50, 1], "#18571a"],
            [["@This 1", "=", 1], [2, "^", "@This 0", "*", 3, "+", 1], ["@HSLA", [-29, "*", "@This 0", "+", 636], [0.95, "^", ["@This 0", "-", 13], "*", 65], 30, 1], "#171a51"]
        ];
        MergeRules = [
            [2, [["@Next 1 0", "=", "@This 0"], "&&", ["@Next 1 1", "!=", "@This 1"]], true, [[["@This 0", "+", 1], ["@This 1", "+", "@Next 1 1"]]], [2, "^", ["@This 0", "+", 1], "*", 3, "+", ["@This 1", "+", "@Next 1 1"]], [false, true]]
        ];
        startTileSpawns = [["Box", 1, [0, -1], [0, 0], [0, 1]]];
        winConditions = [[9, -1], [9, 0], [9, 1]];
        winRequirement = 3;
        document.documentElement.style.setProperty("background-image", "radial-gradient(#cf7a24 0%, #fff 150%)");
        document.documentElement.style.setProperty("--background-color", "#ecdccb");
        document.documentElement.style.setProperty("--grid-color", "#a68c73");
        document.documentElement.style.setProperty("--tile-color", "#c3a589");
        document.documentElement.style.setProperty("--text-color", "#46413c");
        displayRules("rules_text", ["h1", "1535, 1536, 1537"], ["p", 'The starting tiles are 2, 3, and 4, and any two different starting tiles can merge. The "second tier" of tiles is thus 5, 6, and 7, and any two different second-tier tiles can merge, meaning the third tier of tiles is 11, 12, and 13, and in general merges occur between two different tiles of the same tier. To win, make a 1535, a 1536, and a 1537; you do not need to have all of them on the board at once.'],
        ["p", "Spawning tiles: Pulls from a \"box\" that starts with one 2, one 3, and one 4, and only refills once it's empty."]);
        displayRules("gm_rules_text", ["h1", "1535, 1536, 1537"], ["p", 'The starting tiles are 2, 3, and 4, and any two different starting tiles can merge. The "second tier" of tiles is thus 5, 6, and 7, and any two different second-tier tiles can merge, meaning the third tier of tiles is 11, 12, and 13, and in general merges occur between two different tiles of the same tier. To win, make a 1535, a 1536, and a 1537; you do not need to have all of them on the board at once.'],
        ["p", "Spawning tiles: Pulls from a \"box\" that starts with one 2, one 3, and one 4, and only refills once it's empty."]);
        statBoxes = [["Score", "@Score"], ["Discovered Winning Tiles", ["@DiscWinning", "arr_length"]]];
    }
    else if (mode == 30) { // 3072
        width = 4; height = 4; min_dim = 2;
        TileNumAmount = 1;
        TileTypes = [
            [[-1], 1, "#30cbff", "#ffffff"], [[-2], 2, "#ff5462", "#ffffff"],
            [["@This 0", "<", 24], [2, "^", "@This 0", "*", 3], ["@linear-gradient", ["@HSLA", ["@This 0", "*", -15, "+", 46], 100, 65, 1], 0, 15, "#ffffff", 15, 85, ["@HSLA", ["@This 0", "*", -15, "+", 46], 100, 65, 1], 85, 100], "#000000"],
            [true, [2, "^", "@This 0", "*", 3], ["@linear-gradient", ["@HSLA", ["@This 0", "*", -15, "+", 46], 100, [0.75, "^", ["@This 0", "floor", 24, "/", 24], "*", 65], 1], 0, 15, ["@HSLA", 0, 0, [0.75, "^", ["@This 0", "floor", 24, "/", 24], "*", 100], 1], 15, 85, ["@HSLA", ["@This 0", "*", -15, "+", 46], 100, [0.75, "^", ["@This 0", "floor", 24, "/", 24], "*", 65], 1], 85, 100], "#ffffff"],
        ];
        MergeRules = [
            [2, [["@Next 1 0", "=", -1], "&&", ["@This 0", "=", -2]], false, [[0]], 3, [false, true]],
            [2, [["@Next 1 0", "=", "@This 0"], "&&", ["@This 0", ">=", 0]], true, [[["@This 0", "+", 1]]], [2, "^", ["@This 0", "+", 1], "*", 3], [false, true]]
        ];
        startTileSpawns = [["Box", 20, [-1], 4, [-2], 4, [0], 4], [["@CalcArray", "@DiscTiles", "arr_reduce", -2, ["@if", ["@var_retain", "@Var -1", "arr_elem", 0, ">", "@Parent -2"], "2nd", "@Var -1", "@end-if"], "-", 3, "rand_int", 1, "Array"], [0, "@if", ["@DiscTiles", "arr_reduce", -2, ["@if", ["@var_retain", "@Var -1", "arr_elem", 0, ">", "@Parent -2"], "2nd", "@Var -1", "@end-if"], ">=", 4], "2nd", 1, "@end-if"]]];
        winConditions = [[10]];
        winRequirement = 1;
        document.documentElement.style.setProperty("background-image", "radial-gradient(#b2dbe9 0%, #fff 100%)");
        document.documentElement.style.setProperty("--background-color", "#ffffff");
        document.documentElement.style.setProperty("--grid-color", "#6cb9d3");
        document.documentElement.style.setProperty("--tile-color", "#5792a5");
        document.documentElement.style.setProperty("--text-color", "#ff5462");
        displayRules("rules_text", ["h2", "Powers of 2 Times 3"], ["h1", "3072"], ["p", "1s and 2s merge with each other, and all higher tiles merge with themselves. Get to the 3072 tile to win!"],
        ["p", "Spawning tiles: Pulls from a \"box\" containing four 1s, four 2s, and four 3s, which only refills once it's empty. However, if your highest tile is at least 48, there's a 1/21 chance for a \"bonus\" tile to spawn instead, which could be any tile from 6 to the tile that's an eighth of your highest tile."]);
        displayRules("gm_rules_text", ["h2", "Powers of 2 Times 3"], ["h1", "3072"], ["p", "1s and 2s merge with each other, and all higher tiles merge with themselves. Get to the 3072 tile to win!"],
        ["p", "Spawning tiles: Pulls from a \"box\" containing four 1s, four 2s, and four 3s, which only refills once it's empty. However, if your highest tile is at least 48, there's a 1/21 chance for a \"bonus\" tile to spawn instead, which could be any tile from 6 to the tile that's an eighth of your highest tile."],
        ["p", 'Note: This is not a full recreation of Threes!, as moves still work like they do in 2048. To get a better recreation, go to Modifiers, change "Maximum Spaces per Move" to 1, change "Visible Next Spawned Tiles" to 1, change "Tiles Spawned at the Start" to 9, and change the location of tile spawns to be only on the edge you moved away from.']);
    }
    else if (mode == 31) { // Isotopic 256
        width = 3; height = 3; min_dim = 2;
        mode_vars = [0.75]; //Lifespan multiplier
        document.documentElement.style.setProperty("background-image", "radial-gradient(#edcc61 0% 40%, #d6ff63 90%, #fff 150%)");
        document.documentElement.style.setProperty("--background-color", "radial-gradient(#fff5da 0% 50%, #edffbb)");
        document.documentElement.style.setProperty("--grid-color", "#dcca9e");
        document.documentElement.style.setProperty("--tile-color", "#cedc9e");
        document.documentElement.style.setProperty("--text-color", "#525246");
        displayRules("rules_text", ["h1", "Isotopic 256"], ["p", "Regular 2048, but odd powers of 2 other than 2 itself (8, 32, 128, etc.) are radioactive, disappearing if they go without merging for more than 0.75x its number of turns. For aesthetic purposes, the tiles are associated with isotopes of elements with the corresponding atomic mass (though they stop making chemical sense for 256 and above; 256 should be radioactive but isn't, and higher tiles don't have real elements that are that heavy). Get to the <sup>256</sup>No tile to win!"],
        ["p", "Spawning tiles: <sup>2</sup>H (90%), <sup>4</sup>He (10%)"]);
        displayRules("gm_rules_text", ["h1", "Isotopic 256"], ["p", "Regular 2048, but odd powers of 2 other than 2 itself (8, 32, 128, etc.) are radioactive, disappearing if they go without merging for more than 0.75x its number of turns. For aesthetic purposes, the tiles are associated with isotopes of elements with the corresponding atomic mass (though they stop making chemical sense for 256 and above; 256 should be radioactive but isn't, and higher tiles don't have real elements that are that heavy). Get to the <sup>256</sup>No tile to win!"],
        ["p", "Spawning tiles: <sup>2</sup>H (90%), <sup>4</sup>He (10%)"]);
        document.getElementById("mode_vars_line").style.setProperty("display", "block");
        document.getElementById("Isotopic256_vars").style.setProperty("display", "flex");
        if (modifiers[13] == "None") {
            TileNumAmount = 2;
            TileTypes = [
                [["@This 0", "=", 1], "<sup>2</sup>H", "#f9eee3", "#776e65", "none", 3, 0],
                [["@This 0", "=", 2], "<sup>4</sup>He", "#ede0c8", "#776e65", "none", 3, 0],
                [["@This 0", "=", 3], "<sup>8</sup>Be", "#f2b179", "#f9f6f2", "none", 3, 0, ["Innerscript", "@This 1", "bottom-center", 4, 0]],
                [["@This 0", "=", 4], "<sup>16</sup>O", "#f59563", "#f9f6f2", "none", 3, 0],
                [["@This 0", "=", 5], "<sup>32</sup>P", "#f67c5f", "#f9f6f2", "none", 3, 0, ["Innerscript", "@This 1", "bottom-center", 4, 0]],
                [["@This 0", "=", 6], "<sup>64</sup>Ni", "#f65e3b", "#f9f6f2", "none", 3, 0],
                [["@This 0", "=", 7], "<sup>128</sup>Sn", "#edcf72", "#f9f6f2", "none", 3, 0, ["Innerscript", "@This 1", "bottom-center", 4, 0]],
                [["@This 0", "=", 8], "<sup>256</sup>No", "#edcc61", "#f9f6f2", "none", 3, 0],
                [["@This 0", "=", 9], "<sup>512</sup>Uss", "#edc850", "#f9f6f2", "none", 3, 0, ["Innerscript", "@This 1", "bottom-center", 4, 0]],
                [["@This 0", "=", 10], "<sup>1024</sup>Bep", "#edc53f", "#f9f6f2", "none", 3, 0],
                [["@This 0", "=", 11], "<sup>2048</sup>Qsu", "#edc22e", "#f9f6f2", "none", 3, 0, ["Innerscript", "@This 1", "bottom-center", 4, 0]],
                [["@This 0", "=", 12], "<sup>4096</sup>Sbs", "#f29eff", "#f9f6f2", "none", 3, 0],
                [["@This 0", "=", 13], "<sup>8192</sup>Uneh", "#eb75fd", "#f9f6f2", "none", 3, 0, ["Innerscript", "@This 1", "bottom-center", 4, 0]],
                [["@This 0", "=", 14], "<sup>16384</sup>Uhbu", "#e53bff", "#f9f6f2", "none", 3, 0],
                [["@This 0", "=", 15], "<sup>32768</sup>Btho", "#bd00db", "#f9f6f2", "none", 3, 0, ["Innerscript", "@This 1", "bottom-center", 4, 0]],
                [["@This 0", "=", 16], "<sup>65536</sup>Tqbh", "#770089", "#f9f6f2", "none", 3, 0],
                [["@This 0", "=", 17], "<sup>131072</sup>Qebq", "#534de8", "#f9f6f2", "none", 3, 0, ["Innerscript", "@This 1", "bottom-center", 4, 0]],
                [["@This 0", "=", 18], "<sup>262144</sup>Snqq", "#2922e1", "#f9f6f2", "none", 3, 0],
                [["@This 0", "=", 19], "<sup>524288</sup>Unnqb", "#0a05b6", "#f9f6f2", 3, 0, ["Innerscript", "@This 1", "bottom-center", 4, 0]],
                [["@This 0", "%", 2, "=", 0], ["<sup>", "str_concat", [2, "^", "@This 0"], "str_concat", "</sup>", "str_concat", [[[2, "^", "@This 0"], "+", 200, "^", 0.5, "*", 14.1421356237, "-", 200, "round", 1, "String"], ["@Literal", "n", "u", "d", "t", "q", "p", "h", "s", "o", "e"], "@end_vars", -1, "@repeat", ["@var_retain", "@Var 0", "str_length"], "+", 1, "@edit_var", 0, ["@var_retain", "@Var 0", "str_splice", "@Parent -2", 1, ["@var_retain", "@Var 1", "arr_elem", ["@var_retain", "@Var 0", "str_char", "@Parent -4", "Number"]]], "@end-repeat", "@edit_var", 0, ["@var_retain", "@Var 0", "str_splice", 0, 1, ["@var_retain", "@Var 0", "str_char", 0, "str_toUpperCase"]], "2nd", "@Var 0"]], ["@HSLA", [-15, "*", "@This 0", "+", 520], 100, [0.9, "^", ["@This 0", "-", 20], "*", 36], 1], "#f9f6f2", "none", 3, 0],
                [["@This 0", "%", 2, "=", 1], ["<sup>", "str_concat", [2, "^", "@This 0"], "str_concat", "</sup>", "str_concat", [[[2, "^", "@This 0"], "+", 200, "^", 0.5, "*", 14.1421356237, "-", 200, "round", 1, "String"], ["@Literal", "n", "u", "d", "t", "q", "p", "h", "s", "o", "e"], "@end_vars", -1, "@repeat", ["@var_retain", "@Var 0", "str_length"], "+", 1, "@edit_var", 0, ["@var_retain", "@Var 0", "str_splice", "@Parent -2", 1, ["@var_retain", "@Var 1", "arr_elem", ["@var_retain", "@Var 0", "str_char", "@Parent -4", "Number"]]], "@end-repeat", "@edit_var", 0, ["@var_retain", "@Var 0", "str_splice", 0, 1, ["@var_retain", "@Var 0", "str_char", 0, "str_toUpperCase"]], "2nd", "@Var 0"]], ["@HSLA", [-15, "*", "@This 0", "+", 520], 100, [0.9, "^", ["@This 0", "-", 20], "*", 36], 1], "#f9f6f2", "none", 3, 0, ["Innerscript", "@This 1", "bottom-center", 4, 0]]
            ];
            MergeRules = [
                [2, [["@Next 1 0", "=", "@This 0"], "&&", ["@This 0", "%", 2, "=", 1]], true, [[["@This 0", "+", 1], 1e300]], [2, "^", ["@This 0", "+", 1]], [false, true]],
                [2, [["@Next 1 0", "=", "@This 0"], "&&", ["@This 0", "%", 2, "=", 0]], true, [[["@This 0", "+", 1], [2, "^", ["@This 0", "+", 1], "*", 0.75, "round", 1]]], [2, "^", ["@This 0", "+", 1]], [false, true]],
                [0, [["@This 1", ">", 0]], true, [["@This 0", ["@This 1", "-", 1]]], 0],
                [0, [["@This 1", "<=", 0]], true, [], 0],
            ];
            startTileSpawns = [[[1, 1e300], 90], [[2, 1e300], 10]]; //JSON.stringify, which is used for the save codes for things like tiles, converts Infinity to null, so a number that might as well be infinity will have to do for the lifespans of stable tiles
            winConditions = [[["@This 0", "=", 8]]];
            winRequirement = 1;
        }
        else { // The overline above the element symbols for the negative tiles means they're antimatter
            TileNumAmount = 3;
            TileTypes = [
                [[["@This 0", "=", 1], "&&", ["@This 2", "=", 1]], "<sup>2</sup>H", "#f9eee3", "#776e65", "none", 3, 0],
                [[["@This 0", "=", 2], "&&", ["@This 2", "=", 1]], "<sup>4</sup>He", "#ede0c8", "#776e65", "none", 3, 0],
                [[["@This 0", "=", 3], "&&", ["@This 2", "=", 1]], "<sup>8</sup>Be", "#f2b179", "#f9f6f2", "none", 3, 0, ["Innerscript", "@This 1", "bottom-center", 4, 0]],
                [[["@This 0", "=", 4], "&&", ["@This 2", "=", 1]], "<sup>16</sup>O", "#f59563", "#f9f6f2", "none", 3, 0],
                [[["@This 0", "=", 5], "&&", ["@This 2", "=", 1]], "<sup>32</sup>P", "#f67c5f", "#f9f6f2", "none", 3, 0, ["Innerscript", "@This 1", "bottom-center", 4, 0]],
                [[["@This 0", "=", 6], "&&", ["@This 2", "=", 1]], "<sup>64</sup>Ni", "#f65e3b", "#f9f6f2", "none", 3, 0],
                [[["@This 0", "=", 7], "&&", ["@This 2", "=", 1]], "<sup>128</sup>Sn", "#edcf72", "#f9f6f2", "none", 3, 0, ["Innerscript", "@This 1", "bottom-center", 4, 0]],
                [[["@This 0", "=", 8], "&&", ["@This 2", "=", 1]], "<sup>256</sup>No", "#edcc61", "#f9f6f2", "none", 3, 0],
                [[["@This 0", "=", 9], "&&", ["@This 2", "=", 1]], "<sup>512</sup>Uss", "#edc850", "#f9f6f2", "none", 3, 0, ["Innerscript", "@This 1", "bottom-center", 4, 0]],
                [[["@This 0", "=", 10], "&&", ["@This 2", "=", 1]], "<sup>1024</sup>Bep", "#edc53f", "#f9f6f2", "none", 3, 0],
                [[["@This 0", "=", 11], "&&", ["@This 2", "=", 1]], "<sup>2048</sup>Qsu", "#edc22e", "#f9f6f2", "none", 3, 0, ["Innerscript", "@This 1", "bottom-center", 4, 0]],
                [[["@This 0", "=", 12], "&&", ["@This 2", "=", 1]], "<sup>4096</sup>Sbs", "#f29eff", "#f9f6f2", "none", 3, 0],
                [[["@This 0", "=", 13], "&&", ["@This 2", "=", 1]], "<sup>8192</sup>Uneh", "#eb75fd", "#f9f6f2", "none", 3, 0, ["Innerscript", "@This 1", "bottom-center", 4, 0]],
                [[["@This 0", "=", 14], "&&", ["@This 2", "=", 1]], "<sup>16384</sup>Uhbu", "#e53bff", "#f9f6f2", "none", 3, 0],
                [[["@This 0", "=", 15], "&&", ["@This 2", "=", 1]], "<sup>32768</sup>Btho", "#bd00db", "#f9f6f2", "none", 3, 0, ["Innerscript", "@This 1", "bottom-center", 4, 0]],
                [[["@This 0", "=", 16], "&&", ["@This 2", "=", 1]], "<sup>65536</sup>Tqbh", "#770089", "#f9f6f2", "none", 3, 0],
                [[["@This 0", "=", 17], "&&", ["@This 2", "=", 1]], "<sup>131072</sup>Qebq", "#534de8", "#f9f6f2", "none", 3, 0, ["Innerscript", "@This 1", "bottom-center", 4, 0]],
                [[["@This 0", "=", 18], "&&", ["@This 2", "=", 1]], "<sup>262144</sup>Snqq", "#2922e1", "#f9f6f2", "none", 3, 0],
                [[["@This 0", "=", 19], "&&", ["@This 2", "=", 1]], "<sup>524288</sup>Unnqb", "#0a05b6", "#f9f6f2", "none", 3, 0, ["Innerscript", "@This 1", "bottom-center", 4, 0]],
                [[["@This 0", "%", 2, "=", 0], "&&", ["@This 2", "=", 1]], ["<sup>", "str_concat", [2, "^", "@This 0"], "str_concat", "</sup>", "str_concat", [[[2, "^", "@This 0"], "+", 200, "^", 0.5, "*", 14.1421356237, "-", 200, "round", 1, "String"], ["@Literal", "n", "u", "d", "t", "q", "p", "h", "s", "o", "e"], "@end_vars", -1, "@repeat", ["@var_retain", "@Var 0", "str_length"], "+", 1, "@edit_var", 0, ["@var_retain", "@Var 0", "str_splice", "@Parent -2", 1, ["@var_retain", "@Var 1", "arr_elem", ["@var_retain", "@Var 0", "str_char", "@Parent -4", "Number"]]], "@end-repeat", "@edit_var", 0, ["@var_retain", "@Var 0", "str_splice", 0, 1, ["@var_retain", "@Var 0", "str_char", 0, "str_toUpperCase"]], "2nd", "@Var 0"]], ["@HSLA", [-15, "*", "@This 0", "+", 520], 100, [0.9, "^", ["@This 0", "-", 20], "*", 36], 1], "#f9f6f2", "none", 3, 0],
                [[["@This 0", "%", 2, "=", 1], "&&", ["@This 2", "=", 1]], ["<sup>", "str_concat", [2, "^", "@This 0"], "str_concat", "</sup>", "str_concat", [[[2, "^", "@This 0"], "+", 200, "^", 0.5, "*", 14.1421356237, "-", 200, "round", 1, "String"], ["@Literal", "n", "u", "d", "t", "q", "p", "h", "s", "o", "e"], "@end_vars", -1, "@repeat", ["@var_retain", "@Var 0", "str_length"], "+", 1, "@edit_var", 0, ["@var_retain", "@Var 0", "str_splice", "@Parent -2", 1, ["@var_retain", "@Var 1", "arr_elem", ["@var_retain", "@Var 0", "str_char", "@Parent -4", "Number"]]], "@end-repeat", "@edit_var", 0, ["@var_retain", "@Var 0", "str_splice", 0, 1, ["@var_retain", "@Var 0", "str_char", 0, "str_toUpperCase"]], "2nd", "@Var 0"]], ["@HSLA", [-15, "*", "@This 0", "+", 520], 100, [0.9, "^", ["@This 0", "-", 20], "*", 36], 1], "#f9f6f2", "none", 3, 0, ["Innerscript", "@This 1", "bottom-center", 4, 0]],
                [[["@This 0", "=", 1], "&&", ["@This 2", "=", -1]], "<sup>2</sup><span style='text-decoration:overline'>H</span>", "#06111c", "#88919a", "none", 3, 0],
                [[["@This 0", "=", 2], "&&", ["@This 2", "=", -1]], "<sup>4</sup><span style='text-decoration:overline'>He</span>", "#121f37", "#88919a", "none", 3, 0],
                [[["@This 0", "=", 3], "&&", ["@This 2", "=", -1]], "<sup>8</sup><span style='text-decoration:overline'>Be</span>", "#0d4e86", "#06090d", "none", 3, 0, ["Innerscript", "@This 1", "bottom-center", 4, 0]],
                [[["@This 0", "=", 4], "&&", ["@This 2", "=", -1]], "<sup>16</sup><span style='text-decoration:overline'>O</span>", "#0a6a9c", "#06090d", "none", 3, 0],
                [[["@This 0", "=", 5], "&&", ["@This 2", "=", -1]], "<sup>32</sup><span style='text-decoration:overline'>P</span>", "#0983a0", "#06090d", "none", 3, 0, ["Innerscript", "@This 1", "bottom-center", 4, 0]],
                [[["@This 0", "=", 6], "&&", ["@This 2", "=", -1]], "<sup>64</sup><span style='text-decoration:overline'>Ni</span>", "#09a1c4", "#06090d", "none", 3, 0],
                [[["@This 0", "=", 7], "&&", ["@This 2", "=", -1]], "<sup>128</sup><span style='text-decoration:overline'>Sn</span>", "#12308d", "#06090d", "none", 3, 0, ["Innerscript", "@This 1", "bottom-center", 4, 0]],
                [[["@This 0", "=", 8], "&&", ["@This 2", "=", -1]], "<sup>256</sup><span style='text-decoration:overline'>No</span>", "#12339e", "#06090d", "none", 3, 0],
                [[["@This 0", "=", 9], "&&", ["@This 2", "=", -1]], "<sup>512</sup><span style='text-decoration:overline'>Uss</span>", "#1237af", "#06090d", "none", 3, 0, ["Innerscript", "@This 1", "bottom-center", 4, 0]],
                [[["@This 0", "=", 10], "&&", ["@This 2", "=", -1]], "<sup>1024</sup><span style='text-decoration:overline'>Bep</span>", "#123ac0", "#06090d", "none", 3, 0],
                [[["@This 0", "=", 11], "&&", ["@This 2", "=", -1]], "<sup>2048</sup><span style='text-decoration:overline'>Qsu</span>", "#123dd1", "#06090d", "none", 3, 0, ["Innerscript", "@This 1", "bottom-center", 4, 0]],
                [[["@This 0", "=", 12], "&&", ["@This 2", "=", -1]], "<sup>4096</sup><span style='text-decoration:overline'>Sbs</span>", "#0d6100", "#06090d", "none", 3, 0],
                [[["@This 0", "=", 13], "&&", ["@This 2", "=", -1]], "<sup>8192</sup><span style='text-decoration:overline'>Uneh</span>", "#148a02", "#06090d", "none", 3, 0, ["Innerscript", "@This 1", "bottom-center", 4, 0]],
                [[["@This 0", "=", 14], "&&", ["@This 2", "=", -1]], "<sup>16384</sup><span style='text-decoration:overline'>Uhbu</span>", "#1ac400", "#06090d", "none", 3, 0],
                [[["@This 0", "=", 15], "&&", ["@This 2", "=", -1]], "<sup>32768</sup><span style='text-decoration:overline'>Btho</span>", "#42ff24", "#06090d", "none", 3, 0, ["Innerscript", "@This 1", "bottom-center", 4, 0]],
                [[["@This 0", "=", 16], "&&", ["@This 2", "=", -1]], "<sup>65536</sup><span style='text-decoration:overline'>Tqbh</span>", "#88ff76", "##06090d", "none", 3, 0],
                [[["@This 0", "=", 17], "&&", ["@This 2", "=", -1]], "<sup>131072</sup><span style='text-decoration:overline'>Qebq</span>", "#acb217", "#06090d", "none", 3, 0, ["Innerscript", "@This 1", "bottom-center", 4, 0]],
                [[["@This 0", "=", 18], "&&", ["@This 2", "=", -1]], "<sup>262144</sup><span style='text-decoration:overline'>Snqq</span>", "#d6dd1e", "#06090d", "none", 3, 0],
                [[["@This 0", "=", 19], "&&", ["@This 2", "=", -1]], "<sup>524288</sup><span style='text-decoration:overline'>Unnqb</span>", "#f5fa49", "#06090d", "none", 3, 0, ["@This 1", "bottom-center", 4, 0]],
                [[["@This 0", "%", 2, "=", 0], "&&", ["@This 2", "=", -1]], ["<sup>", "str_concat", [2, "^", "@This 0"], "str_concat", "</sup><span style='text-decoration:overline'>", "str_concat", [[[2, "^", "@This 0"], "+", 200, "^", 0.5, "*", 14.1421356237, "-", 200, "round", 1, "String"], ["@Literal", "n", "u", "d", "t", "q", "p", "h", "s", "o", "e"], "@end_vars", -1, "@repeat", ["@var_retain", "@Var 0", "str_length"], "+", 1, "@edit_var", 0, ["@var_retain", "@Var 0", "str_splice", "@Parent -2", 1, ["@var_retain", "@Var 1", "arr_elem", ["@var_retain", "@Var 0", "str_char", "@Parent -4", "Number"]]], "@end-repeat", "@edit_var", 0, ["@var_retain", "@Var 0", "str_splice", 0, 1, ["@var_retain", "@Var 0", "str_char", 0, "str_toUpperCase"]], "2nd", "@Var 0"], "str_concat", "</span>"], ["@HSLA", [-15, "*", "@This 0", "+", 340], 100, [100, "-", [0.9, "^", ["@This 0", "-", 20], "*", 36]], 1], "#06090d", "none", 3, 0],
                [[["@This 0", "%", 2, "=", 1], "&&", ["@This 2", "=", -1]], ["<sup>", "str_concat", [2, "^", "@This 0"], "str_concat", "</sup><span style='text-decoration:overline'>", "str_concat", [[[2, "^", "@This 0"], "+", 200, "^", 0.5, "*", 14.1421356237, "-", 200, "round", 1, "String"], ["@Literal", "n", "u", "d", "t", "q", "p", "h", "s", "o", "e"], "@end_vars", -1, "@repeat", ["@var_retain", "@Var 0", "str_length"], "+", 1, "@edit_var", 0, ["@var_retain", "@Var 0", "str_splice", "@Parent -2", 1, ["@var_retain", "@Var 1", "arr_elem", ["@var_retain", "@Var 0", "str_char", "@Parent -4", "Number"]]], "@end-repeat", "@edit_var", 0, ["@var_retain", "@Var 0", "str_splice", 0, 1, ["@var_retain", "@Var 0", "str_char", 0, "str_toUpperCase"]], "2nd", "@Var 0"], "str_concat", "</span>"], ["@HSLA", [-15, "*", "@This 0", "+", 340], 100, [100, "-", [0.9, "^", ["@This 0", "-", 20], "*", 36]], 1], "#06090d", "none", 3, 0, ["Innerscript", "@This 1", "bottom-center", 4, 0]]
            ];
            MergeRules = [
                [2, [["@Next 1 0", "=", "@This 0"], "&&", ["@This 0", "%", 2, "=", 1], "&&", ["@This 2", "=", "@Next 1 2"]], true, [[["@This 0", "+", 1], 1e300, "@This 2"]], [2, "^", ["@This 0", "+", 1]], [false, true]], //Infinity gets replaced by null in save codes, so a number that might as well be infinity will have to do for the lifespans of stable tiles
                [2, [["@Next 1 0", "=", "@This 0"], "&&", ["@This 0", "%", 2, "=", 0], "&&", ["@This 2", "=", "@Next 1 2"]], true, [[["@This 0", "+", 1], [2, "^", ["@This 0", "+", 1], "*", 0.75, "round", 1], "@This 2"]], [2, "^", ["@This 0", "+", 1]], [false, true]],
                [0, [["@This 1", ">", 0]], true, [["@This 0", ["@This 1", "-", 1], "@This 2"]], 0],
                [0, [["@This 1", "<=", 0]], true, [], 0],
            ];
            if (modifiers[13] == "Interacting") MergeRules.unshift([2, [["@Next 1 0", "=", "@This 0"], "&&", ["@This 2", "!=", "@Next 1 2"]], true, [], 0, [true, true]])
            startTileSpawns = [[[1, 1e300, 1], 90], [[2, 1e300, 1], 10], [[1, 1e300, -1], 90], [[2, 1e300, -1], 10]];
            winConditions = [[["@This 0", "=", 8]]];
            winRequirement = 2;
        }
    }
    else if (mode == 32) { // Bicolor 2187
        width = 4; height = 4; min_dim = 2;
        TileNumAmount = 2;
        TileTypes = [[[0, 1], 1, "#ffffff", "#584153"], [[0, 2], 2, "#999999", "#f6ebf4"],
        [[1, 1], 3, ["@linear-gradient", "#ff3030", 0, "#ffffa2", 25, 75, "#ff3030", 100], "#584153"],
        [[1, -1], 3, ["@linear-gradient", "#3030ff", 0, "#ffffa2", 25, 75, "#3030ff", 100], "#584153"],
        [[1, 2], 6, "#e6e600", "#f6ebf4"],
        [[2, 1], 9, ["@linear-gradient", "#ff3030", 0, "#ff8181", 25, 75, "#ff3030", 100], "#584153"],
        [[2, -1], 9, ["@linear-gradient", "#3030ff", 0, "#ff8181", 25, 75, "#3030ff", 100], "#584153"],
        [[2, 2], 18, "#ff0000", "#f6ebf4"],
        [[3, 1], 27, ["@linear-gradient", "#ff3030", 0, "#ffb96f", 25, 75, "#ff3030", 100], "#584153"],
        [[3, -1], 27, ["@linear-gradient", "#3030ff", 0, "#ffb96f", 25, 75, "#3030ff", 100], "#584153"],
        [[3, 2], 54, "#ff8400", "#f6ebf4"],
        [[4, 1], 81, ["@linear-gradient", "#ff3030", 0, "#6d62ff", 25, 75, "#ff3030", 100], "#584153"],
        [[4, -1], 81, ["@linear-gradient", "#3030ff", 0, "#6d62ff", 25, 75, "#3030ff", 100], "#584153"],
        [[4, 2], 162, "#0f00e4", "#f6ebf4"],
        [[5, 1], 243, ["@linear-gradient", "#ff3030", 0, "#96ff69", 25, 75, "#ff3030", 100], "#584153"],
        [[5, -1], 243, ["@linear-gradient", "#3030ff", 0, "#96ff69", 25, 75, "#3030ff", 100], "#584153"],
        [[5, 2], 486, "#42dd00", "#f6ebf4"],
        [[6, 1], 729, ["@linear-gradient", "#ff3030", 0, "#e07bff", 25, 75, "#ff3030", 100], "#584153"],
        [[6, -1], 729, ["@linear-gradient", "#3030ff", 0, "#e07bff", 25, 75, "#3030ff", 100], "#584153"],
        [[6, 2], 1458, "#bf00fa", "#f6ebf4"],
        [[7, 1], 2187, ["@linear-gradient", "#ff3030", 0, "#ff5ae6", 25, 75, "#ff3030", 100], "#584153"],
        [[7, -1], 2187, ["@linear-gradient", "#3030ff", 0, "#ff5ae6", 25, 75, "#3030ff", 100], "#584153"],
        [[7, 2], 4374, "#d600b6", "#f6ebf4"],
        [[8, 1], 6561, ["@linear-gradient", "#ff3030", 0, "#ffda69", 25, 75, "#ff3030", 100], "#584153"],
        [[8, -1], 6561, ["@linear-gradient", "#3030ff", 0, "#ffda69", 25, 75, "#3030ff", 100], "#584153"],
        [[8, 2], 13122, "#ffbf00", "#f6ebf4"],
        [[9, 1], 19683, ["@linear-gradient", "#ff3030", 0, "#e5ff7c", 25, 75, "#ff3030", 100], "#584153"],
        [[9, -1], 19683, ["@linear-gradient", "#3030ff", 0, "#e5ff7c", 25, 75, "#3030ff", 100], "#584153"],
        [[9, 2], 39366, "#ccff00", "#f6ebf4"],
        [[10, 1], 59049, ["@linear-gradient", "#ff3030", 0, "#78fdff", 25, 75, "#ff3030", 100], "#584153"],
        [[10, -1], 59049, ["@linear-gradient", "#3030ff", 0, "#78fdff", 25, 75, "#3030ff", 100], "#584153"],
        [[10, 2], 118098, "#00d7da", "#f6ebf4"],
        [[11, 1], 177147, ["@linear-gradient", "#ff3030", 0, "#ff896e", 25, 75, "#ff3030", 100], "#584153"],
        [[11, -1], 177147, ["@linear-gradient", "#3030ff", 0, "#ff896e", 25, 75, "#3030ff", 100], "#584153"],
        [[11, 2], 354294, "#e55000", "#f6ebf4"],
        [[12, 1], 531441, ["@linear-gradient", "#ff3030", 0, "#6baeff", 25, 75, "#ff3030", 100], "#584153"],
        [[12, -1], 531441, ["@linear-gradient", "#3030ff", 0, "#6baeff", 25, 75, "#3030ff", 100], "#584153"],
        [[12, 2], 1062882, "#0073ff", "#f6ebf4"],
        [["@This 1", "=", 1], [3, "^", "@This 0"], ["@linear-gradient", "#ff3030", 0, ["@HSLA", [97, "*", "@This 0", "-", 1111], [0.9, "^", ["@This 0", "-", 12], "*", 100], 70, 1], 25, 75, "#ff3030", 100], "#584153"],
        [["@This 1", "=", -1], [3, "^", "@This 0"], ["@linear-gradient", "#3030ff", 0, ["@HSLA", [97, "*", "@This 0", "-", 1111], [0.9, "^", ["@This 0", "-", 12], "*", 100], 70, 1], 25, 75, "#3030ff", 100], "#584153"],
        [["@This 1", "=", 2], [3, "^", "@This 0", "*", 2], ["@HSLA", [97, "*", "@This 0", "-", 1111], [0.9, "^", ["@This 0", "-", 12], "*", 100], 35, 1], "#f6ebf4"]];
        MergeRules = [
            [2, [["@Next 1 0", "=", "@This 0"], "&&", ["@Next 1 1", "=", -1], "&&", ["@This 1", "=", 1]], false, [["@This 0", 2]], [3, "^", "@This 0", "*", 2], [false, true]],
            [2, [["@Next 1 0", "=", "@This 0"], "&&", ["@Next 1 1", "=", 2], "&&", ["@This 1", "abs", "=", 1]], true, [[["@This 0", "+", 1], -1]], [3, "^", ["@This 0", "+", 1]], [false, true]],
            [2, [["@Next 1 0", "=", "@This 0"], "&&", ["@Next 1 1", "abs", "=", 1], "&&", ["@This 1", "=", 2]], true, [[["@This 0", "+", 1], 1]], [3, "^", ["@This 0", "+", 1]], [false, true]],
            [2, [["@Next 1 0", "=", 0], "&&", ["@This 0", "=", 0], "&&", ["@Next 1 1", "=", 1], "&&", ["@This 1", "=", 1]], true, [[0, 2]], 2, [false, true]]
        ];
        startTileSpawns = [[[0, 1], 85], [[0, 2], 10], [[1, 1], 2.5], [[1, -1], 2.5]];
        winConditions = [[7, 1], [7, -1]];
        winRequirement = 1;
        document.documentElement.style.setProperty("background-image", "linear-gradient(#ff8080 0%, #ff00d9 25% 75%, #8080ff 100%)");
        document.documentElement.style.setProperty("--background-color", "linear-gradient(#ffbbbb 0%, #ff00ff 25% 75%, #bbbbff 100%)");
        document.documentElement.style.setProperty("--grid-color", "#c7a7c4");
        document.documentElement.style.setProperty("--tile-color", "#ecc2e6");
        document.documentElement.style.setProperty("--text-color", "#3c2237");
        displayRules("rules_text", ["h1", "Bicolor 2187"], ["p","2187 mode, except tiles that are powers of 3 (other than 1) come in two colors. Two tiles that are a power of three can only merge if they're opposite colors, and which color a power of three tile is depends on which of the two tiles that merged to make it was the one that collided into the other one: the resulting tile is blue if the previous power of three collided into its double, the resulting tile is red if the previous power of three's double collided into its half. Get to either 2187 tile to win!"],
        ["p", "Spawning tiles: 1 (85%), 2 (10%), Red 3 (2.5%), Blue 3 (2.5%)"]);
        displayRules("gm_rules_text", ["h1", "Bicolor 2187"], ["p","2187 mode, except tiles that are powers of 3 (other than 1) come in two colors. Two tiles that are a power of three can only merge if they're opposite colors, and which color a power of three tile is depends on which of the two tiles that merged to make it was the one that collided into the other one: the resulting tile is blue if the previous power of three collided into its double, the resulting tile is red if the previous power of three's double collided into its half. Get to either 2187 tile to win!"],
        ["p", "Spawning tiles: 1 (85%), 2 (10%), Red 3 (2.5%), Blue 3 (2.5%)"]);
    }
    else if (mode == 33) { // Harder 3125
        width = 5; height = 5; min_dim = 3;
        TileNumAmount = 2;
        TileTypes = [[[0, 1], 1, "#ffffff", "#505246"], [[0, 3], 3, "#898989", "#f4f7e9"],
        [[1, 1], 5, "#ff9f9f", "#505246"], [[1, 3], 15, "#ff3a3a", "#f4f7e9"],
        [[2, 1], 25, "#9fa2ff", "#505246"], [[2, 3], 75, "#0d15ff", "#f4f7e9"],
        [[3, 1], 125, "#fffa9f", "#505246"], [[3, 3], 375, "#ebdf00", "#f4f7e9"],
        [[4, 1], 625, "#df9fff", "#505246"], [[4, 3], 1875, "#bc35ff", "#f4f7e9"],
        [[5, 1], 3125, "#e9ff9f", "#505246"], [[5, 3], 9375, "#c9ff16", "#f4f7e9"],
        [[6, 1], 15625, "#ff9fda", "#505246"], [[6, 3], 46875, "#ff23ab", "#f4f7e9"],
        [[7, 1], 78125, "#9fffbf", "#505246"], [[7, 3], 234375, "#0aff5c", "#f4f7e9"],
        [[8, 1], 390625, "#ffc19f", "#505246"], [[8, 3], 1171875, "#ff772e", "#f4f7e9"],
        [[9, 1], 1953125, "#9ff4ff", "#505246"], [[9, 3], 5859375, "#00e1ff", "#f4f7e9"],
        [[10, 1], 9765625, "#ffe79f", "#505246"], [[10, 3], 29296875, "#ffcd36", "#f4f7e9"],
        [[11, 1], 48828125, "#9fc2ff", "#505246"], [[11, 3], 146484375, "#1e71ff", "#f4f7e9"],
        [["@This 1", "=", 1], [5, "^", "@This 0"], ["@HSLA", [23.5, "*", "@This 0", "-", 212, "+", ["@This 0", "%", 2, "*", 156.5]], [0.95, "^", ["@This 0", "-", 12], "*", 75], 70, 1], "#505246"],
        [["@This 1", "=", 3], [5, "^", "@This 0", "*", 3], ["@HSLA", [23.5, "*", "@This 0", "-", 212, "+", ["@This 0", "%", 2, "*", 156.5]], [0.95, "^", ["@This 0", "-", 12], "*", 75], 50, 1], "#f4f7e9"],];
        MergeRules = [
            [3, [["@Next 1 0", "=", "@This 0"], "&&", ["@Next 2 0", "=", "@This 0"], "&&", ["@This 1", "=", 1], "&&", ["@Next 1 1", "=", 1], "&&", ["@Next 2 1", "=", 1]], true, [["@This 0", 3]], [5, "^", "@This 0", "*", 3], [false, true, true]],
            [3, [["@Next 1 0", "=", "@This 0"], "&&", ["@Next 2 0", "=", "@This 0"], "&&", ["@This 1", "=", 1], "&&", ["@Next 1 1", "=", 1], "&&", ["@Next 2 1", "=", 3]], false, [[["@This 0", "+", 1], 1]], [5, "^", ["@This 0", "+", 1]], [false, true, true]]
        ]
        startTileSpawns = [[[0, 1], 90], [[0, 3], 10]];
        winConditions = [[5, 1]];
        winRequirement = 1;
        document.documentElement.style.setProperty("background-image", "radial-gradient(#8fba00 0%, #fff 150%)");
        document.documentElement.style.setProperty("--background-color", "#dde6c4");
        document.documentElement.style.setProperty("--grid-color", "#bec59d");
        document.documentElement.style.setProperty("--tile-color", "#e0eab7");
        document.documentElement.style.setProperty("--text-color", "#3e3f36");
        displayRules("rules_text", ["h1", "Harder 3125"], ["p","Merges occur between three equal tiles that are a power of five, or between two equal tiles that are a power of five and one tile that's triple that power of 5. Get to the 3125 tile to win!"],
        ["p", "Spawning tiles: 1 (90%), 3 (10%)"]);
        displayRules("gm_rules_text", ["h1", "Harder 3125"], ["p","3125 is a little too easy, so here's a mode that makes it more challenging. Merges occur between three equal tiles that are a power of five, or between two equal tiles that are a power of five and one tile that's triple that power of 5. Get to the 3125 tile to win!"],
        ["p", "Spawning tiles: 1 (90%), 3 (10%)"]);
    }
    else if (mode == 34) { // Partial Absorb 243 (yes, I'm aware that the partial absorb modes aren't good, sorry)
        width = 5; height = 5; min_dim = 2;
        TileNumAmount = 2;
        TileTypes = [[[0, 1], 1, "#ffffff", "#584153"], [[0, 2], 2, "#999999", "#f6ebf4"],
        [[1, 1], 3, "#ffffa2", "#584153"], [[1, 2], 4, "#e6e600", "#584153"], [[1, 3], 6, "#a1a100", "#f6ebf4"],
        [[2, 1], 9, "#ff8181", "#584153"], [[2, 2], 12, "#ff0000", "#584153"], [[2, 3], 18, "#9a0000", "#f6ebf4"],
        [[3, 1], 27, "#ffb96f", "#584153"], [[3, 2], 36, "#ff8400", "#584153"], [[3, 3], 54, "#994f00", "#f6ebf4"],
        [[4, 1], 81, "#6d62ff", "#584153"], [[4, 2], 108, "#1100ff", "#584153"], [[4, 3], 162, "#08007d", "#f6ebf4"],
        [[5, 1], 243, "#b8ff99", "#584153"], [[5, 2], 324, "#4dff00", "#584153"], [[5, 3], 486, "#247800", "#f6ebf4"],
        [[6, 1], 729, "#e07bff", "#584153"], [[6, 2], 972, "#c300ff", "#584153"], [[6, 3], 1458, "#690088", "#f6ebf4"],
        [[7, 1], 2187, "#ff7aeb", "#584153"], [[7, 2], 2916, "#ff00d9", "#584153"], [[7, 3], 4374, "#6c005c", "#f6ebf4"],
        [[8, 1], 6561, "#ffda69", "#584153"], [[8, 2], 8748, "#ffbf00", "#584153"], [[8, 3], 13122, "#8e6a00", "#f6ebf4"],
        [[9, 1], 19683, "#e5ff7c", "#584153"], [[9, 2], 26244, "#ccff00", "#584153"], [[9, 3], 39366, "#7e9e00", "#f6ebf4"],
        [[10, 1], 59049, "#a2fdff", "#584153"], [[10, 2], 78732, "#00fbff", "#584153"], [[10, 3], 118098, "#00aeb1", "#f6ebf4"],
        [[11, 1], 177147, "#ff896e", "#584153"], [[11, 2], 236196, "#ff5900", "#584153"], [[11, 3], 354294, "#832e00", "#f6ebf4"],
        [[12, 1], 531441, "#6baeff", "#584153"], [[12, 2], 708588, "#0073ff", "#584153"], [[12, 3], 1062882, "#003e8a", "#f6ebf4"],
        [["@This 1", "=", 1], [3, "^", "@This 0"], ["@HSLA", [97, "*", "@This 0", "-", 1111], [0.9, "^", ["@This 0", "-", 12], "*", 100], 70, 1], "#584153"],
        [["@This 1", "=", 2], [3, "^", "@This 0", "*", 4, "/", 3], ["@HSLA", [97, "*", "@This 0", "-", 1111], [0.9, "^", ["@This 0", "-", 12], "*", 100], 50, 1], "#584153"],
        [["@This 1", "=", 3], [3, "^", "@This 0", "*", 2], ["@HSLA", [97, "*", "@This 0", "-", 1111], [0.9, "^", ["@This 0", "-", 12], "*", 100], 30, 1], "#f6ebf4"]];
        MergeRules = [
            [2, [["@Next 1 0", "=", 0], "&&", ["@This 0", "=", 0], "&&", ["@Next 1 1", "=", 1], "&&", ["@This 1", "=", 1]], true, [[0, 2]], 2, [false, true]],
            [2, [["@Next 1 0", "=", 0], "&&", ["@This 0", "=", 0], "&&", ["@Next 1 1", "=", 2], "&&", ["@This 1", "=", 2]], true, [[1, 1], [0, 1]], 3, [false, false]],
            [2, [["@Next 1 0", "=", 1], "&&", ["@This 0", "=", 1], "&&", ["@Next 1 1", "=", 1], "&&", ["@This 1", "=", 1]], true, [[1, 2], [0, 2]], 4, [false, false]],
            [2, [["@Next 1 0", "=", 1], "&&", ["@This 0", "=", 1], "&&", ["@Next 1 1", "=", 2], "&&", ["@This 1", "=", 2]], true, [[1, 3], [0, 2]], 6, [false, false]],
            [2, [["@Next 1 0", "=", "@This 0"], "&&", ["@This 0", ">", 1], "&&", ["@Next 1 1", "=", 1], "&&", ["@This 1", "=", 1]], true, [["@This 0", 2], [["@This 0", "-", 1], 3]], [3, "^", "@This 0", "*", 4, "/", 3], [false, false]],
            [2, [["@Next 1 0", "=", "@This 0"], "&&", ["@This 0", ">", 1], "&&", ["@Next 1 1", "=", 2], "&&", ["@This 1", "=", 2]], true, [["@This 0", 3], [["@This 0", "-", 1], 3]], [3, "^", "@This 0", "*", 2], [false, false]],
            [2, [["@Next 1 0", "=", "@This 0"], "&&", ["@This 0", ">", 0], "&&", ["@Next 1 1", "=", 3], "&&", ["@This 1", "=", 3]], true, [[["@This 0", "+", 1], 1], ["@This 0", 1]], [3, "^", "@This 0", "*", 3], [false, false]],
        ];
        startTileSpawns = [[[0, 1], 85], [[0, 2], 10], [[1, 1], 5]];
        winConditions = [[5, 1]];
        winRequirement = 1;
        document.documentElement.style.setProperty("background-image", "radial-gradient(#ff00d9 0%, #000 150%)");
        document.documentElement.style.setProperty("--background-color", "linear-gradient(#ffdaf9, #b689af)");
        document.documentElement.style.setProperty("--grid-color", "#c7a7c4");
        document.documentElement.style.setProperty("--tile-color", "#ecc2e6");
        document.documentElement.style.setProperty("--text-color", "#3c2237");
        displayRules("rules_text", ["h1", "Partial Absorb 243"], ["p","Merges occur between two tiles that are the same number. If those are two 1s, they will merge into a 2 as normal, but higher tiles don't merge completely. When two even numbers merge, only half of the colliding tile is absorbed into the result: for example, two 2s merge into a 3 and a 1. If the merging tiles aren't even, they must be a power of three, in which case only a third of the colliding tile is merged into the result: for example, two 3s merge into a 4 and a 2. Get to the 243 tile to win!"],
        ["p", "Spawning tiles: 1 (85%), 2 (10%), 3 (5%)"]);
        displayRules("gm_rules_text", ["h1", "Partial Absorb 243"], ["p","Merges occur between two tiles that are the same number. If those are two 1s, they will merge into a 2 as normal, but higher tiles don't merge completely. When two even numbers merge, only half of the colliding tile is absorbed into the result: for example, two 2s merge into a 3 and a 1. If the merging tiles aren't even, they must be a power of three, in which case only a third of the colliding tile is merged into the result: for example, two 3s merge into a 4 and a 2. Get to the 243 tile to win!"],
        ["p", "Spawning tiles: 1 (85%), 2 (10%), 3 (5%)"]);
    }
    else if (mode == 35) { // Partial Absorb 256
        width = 6; height = 6; min_dim = 3;
        TileNumAmount = 1;
        TileTypes = [[[1], 1, "#ffffff", "#746577"], [[2], 3, "#d8ffb6", "#746577"], [[3], 7, "#a7ff5a", "#746577"],
        [[4], 15, "#77ff00", "#746577"], [[5], 31, "#00ff33", "#746577"], [[6], 63, "#00ff9d", "#746577"], [[7], 127, "#00ffd9", "#746577"],
        [[8], 255, "#dba6ff", "#f5eff7"], [[9], 511, "#c671ff", "#f5eff7"], [[10], 1023, "#b23eff", "#f5eff7"], [[11], 2047, "#9900ff", "#f5eff7"],
        [[12], 4095, "#ff9ed0", "#f5eff7"], [[13], 8191, "#ff62b3", "#f5eff7"], [[14], 16383, "#ff2b99", "#f5eff7"], [[15], 32767, "#e90079", "#f5eff7"],
        [[16], 65535, "#9d0051", "#f5eff7"], [[17], 131071, "#ff7b4f", "#f5eff7"], [[18], 262143, "#ff4000", "#f5eff7"], [[19], 524287, "#bf3000", "#f5eff7"],
        [true, [2, "^", "@This 0", "-", 1], ["@HSLA", [15, "*", "@This 0", "-", 265], 100, [0.9, "^", ["@This 0", "-", 20], "*", 36], 1], "#f5eff7"]];
        MergeRules = [
            [3, [["@Next 1 0", "=", 1], "&&", ["@Next 2 0", "=", 1], "&&", ["@This 0", "=", 1]], true, [[2]], 3, [false, true, true]],
            [3, [["@Next 1 0", "=", "@This 0"], "&&", ["@Next 2 0", "=", "@This 0"], "&&", ["@This 0", ">", 1]], true, [[["@This 0", "+", 1]], [["@This 0", "-", 1]], [["@This 0", "-", 1]]], [2, "^", ["@This 0", "+", 1], "-", 1], [false, false, false]]
        ];
        startTileSpawns = [[[1], 95], [[2], 5]];
        winConditions = [[8]];
        winRequirement = 1;
        document.documentElement.style.setProperty("background-image", "radial-gradient(#9900ff 0%, #000 150%)");
        document.documentElement.style.setProperty("--background-color", "linear-gradient(#f1daff, #b59cc4)");
        document.documentElement.style.setProperty("--grid-color", "#bca7c7");
        document.documentElement.style.setProperty("--tile-color", "#dac2ec");
        document.documentElement.style.setProperty("--text-color", "#4e4652");
        displayRules("rules_text", ["h1", "Partial Absorb 255"], ["p", "Merges occur between three equal tiles. Three 1s will merge into a single 3, but for higher tiles, the result tile will only absorb 0.5 more than half of each of the other two tiles, meaning the result tile becomes the next tile while the other two tiles become the previous tile. Get to the 255 tile to win!"],
        ["p", "Spawning tiles: 1 (95%), 3 (5%)"]);
        displayRules("gm_rules_text", ["h1", "Partial Absorb 255"], ["p", "Merges occur between three equal tiles. Three 1s will merge into a single 3, but for higher tiles, the result tile will only absorb 0.5 more than half of each of the other two tiles, meaning the result tile becomes the next tile while the other two tiles become the previous tile. Get to the 255 tile to win!"],
        ["p", "Spawning tiles: 1 (95%), 3 (5%)"]);
    }
    else if (mode == 36) { // 1280
        width = 8; height = 8; min_dim = 3;
        TileNumAmount = 2;
        TileTypes = [
            [[0, 2], 2, "#79ff94", "#3b3338"], [[0, 3], 3, "#00ff33", "#3b3338"], [[0, 5], 5, "#00a120", "#f1e1eb"],
            [[1, 2], 4, "#c7ff6e", "#3b3338"], [[1, 3], 6, "#9dff00", "#3b3338"], [[1, 5], 10, "#619e00", "#f1e1eb"],
            [[2, 2], 8, "#f8ff7b", "#3b3338"], [[2, 3], 12, "#f2ff00", "#3b3338"], [[2, 5], 20, "#9da500", "#f1e1eb"],
            [[3, 2], 16, "#ffef77", "#3b3338"], [[3, 3], 24, "#ffe100", "#3b3338"], [[3, 5], 40, "#ad9900", "#f1e1eb"],
            [[4, 2], 32, "#ffd16e", "#3b3338"], [[4, 3], 48, "#ffae00", "#3b3338"], [[4, 5], 80, "#9e6c00", "#f1e1eb"],
            [[5, 2], 64, "#ffae67", "#3b3338"], [[5, 3], 96, "#ff7700", "#3b3338"], [[5, 5], 160, "#a34c00", "#f1e1eb"],
            [[6, 2], 128, "#ff7d55", "#3b3338"], [[6, 3], 192, "#ff3c00", "#3b3338"], [[6, 5], 320, "#9f2500", "#f1e1eb"],
            [[7, 2], 256, "#ff5e7b", "#3b3338"], [[7, 3], 384, "#ff002f", "#3b3338"], [[7, 5], 640, "#9e001d", "#f1e1eb"],
            [[8, 2], 512, "#ff5fc2", "#3b3338"], [[8, 3], 768, "#ff009d", "#3b3338"], [[8, 5], 1280, "#a30065", "#f1e1eb"],
            [[9, 2], 1024, "#ff85ff", "#3b3338"], [[9, 3], 1536, "#ff00ff", "#3b3338"], [[9, 5], 2560, "#a200a2", "#f1e1eb"],
            [[10, 2], 2048, "#e476ff", "#3b3338"], [[10, 3], 3072, "#cc00ff", "#3b3338"], [[10, 5], 5120, "#8200a2", "#f1e1eb"],
            [[11, 2], 4096, "#a35cff", "#3b3338"], [[11, 3], 6144, "#6f00ff", "#3b3338"], [[11, 5], 10240, "#45009f", "#f1e1eb"],
            [[12, 2], 8192, "#6e6eff", "#3b3338"], [[12, 3], 12288, "#0000ff", "#3b3338"], [[12, 5], 20480, "#00008f", "#f1e1eb"],
            [[13, 2], 16384, "#5a9fff", "#3b3338"], [[13, 3], 24576, "#006aff", "#3b3338"], [[13, 5], 40960, "#0046a9", "#f1e1eb"],
            [[14, 2], 32768, "#79d5ff", "#3b3338"], [[14, 3], 49152, "#00aeff", "#3b3338"], [[14, 5], 81920, "#006d9f", "#f1e1eb"],
            [[15, 2], 65536, "#8af5ff", "#3b3338"], [[15, 3], 98304, "#00eaff", "#3b3338"], [[15, 5], 163840, "#009ba9", "#f1e1eb"],
            [[16, 2], 131072, "#90fff0", "#3b3338"], [[16, 3], 196608, "#00ffdd", "#3b3338"], [[16, 5], 327680, "#00a993", "#f1e1eb"],
            [["@This 1", "=", 2], [2, "^", "@This 0", "*", 2], ["@HSLA", [-21.5, "*", "@This 0", "+", 505.5], [0.985, "^", ["@This 0", "-", 17], "*", 70], 70, 1], "#3b3338"],
            [["@This 1", "=", 3], [2, "^", "@This 0", "*", 3], ["@HSLA", [-21.5, "*", "@This 0", "+", 505.5], [0.985, "^", ["@This 0", "-", 17], "*", 70], 50, 1], "#3b3338"],
            [["@This 1", "=", 5], [2, "^", "@This 0", "*", 5], ["@HSLA", [-21.5, "*", "@This 0", "+", 505.5], [0.985, "^", ["@This 0", "-", 17], "*", 70], 30, 1], "#f1e1eb"]
        ];
        MergeRules = [
            [3, [["@Next 1 0", "=", "@This 0"], "&&", ["@Next 2 0", "=", "@This 0"], "&&", ["@Next 1 1", "=", 2], "&&", ["@Next 2 1", "=", 2], "&&", ["@This 1", "=", 2]], true, [["@This 0", 3], ["@This 0", 3]], [2, "^", "@This 0", "*", 6], [false, false, true]],
            [3, [["@Next 1 0", "=", "@This 0"], "&&", ["@Next 2 0", "=", "@This 0"], "&&", ["@Next 1 1", "=", 3], "&&", ["@Next 2 1", "=", 3], "&&", ["@This 1", "=", 3]], true, [["@This 0", 5], [["@This 0", "+", 1], 2]], [2, "^", "@This 0", "*", 9], [false, false, true]],
            [3, [["@Next 1 0", "=", "@This 0"], "&&", ["@Next 2 0", "=", "@This 0"], "&&", ["@Next 1 1", "=", 5], "&&", ["@Next 2 1", "=", 5], "&&", ["@This 1", "=", 5]], true, [[["@This 0", "+", 2], 3], ["@This 0", 3]], [2, "^", "@This 0", "*", 15], [false, false, true]],
        ]
        startTileSpawns = [[[0, 2], 85], [[0, 3], 15]];
        winConditions = [[8, 5]];
        winRequirement = 1;
        document.documentElement.style.setProperty("background-image", "radial-gradient(#9a005f 0%, #fff 150%)");
        document.documentElement.style.setProperty("--background-color", "#c0a3b4");
        document.documentElement.style.setProperty("--grid-color", "#877280");
        document.documentElement.style.setProperty("--tile-color", "#b799ab");
        document.documentElement.style.setProperty("--text-color", "#3b3338");
        displayRules("rules_text", ["h1", "1280"], ["p","Merges occur between three tiles that are the same number. If these three tiles are a power of two, then they merge into two tiles that are each 1.5 times that power of two. If these three tiles are triple a power of two, then they merge into a tile that's 5 times that power of two and a tile that's 4 times that power of two. If these three tiles are quintuple a power of two, then they merge into a tile that's 12 times that power of two and a tile that's 3 times that power of two. Get to the 1280 tile to win!"],
        ["p", "Spawning tiles: 2 (85%), 3 (15%)"]);
        displayRules("gm_rules_text", ["h1", "1280"], ["p","Merges occur between three tiles that are the same number. If these three tiles are a power of two, then they merge into two tiles that are each 1.5 times that power of two. If these three tiles are triple a power of two, then they merge into a tile that's 5 times that power of two and a tile that's 4 times that power of two. If these three tiles are quintuple a power of two, then they merge into a tile that's 12 times that power of two and a tile that's 3 times that power of two. Get to the 1280 tile to win!"],
        ["p", "Spawning tiles: 2 (85%), 3 (15%)"]);
    }
    else if (mode == 37) { // 2216.8378200531005859375
        width = 5; height = 5; min_dim = 2;
        TileNumAmount = 2;
        TileTypes = [
            [["Div2", "@Signless"], "&#247;2", ["@linear-gradient", "#cccccc", "#444444"], "#765c8f"],
            [[0, 1], 1, "#ffffff", "#3f3d32"], [[0, 2], 0.5, "#999999", "#625b2f"],
            [[1, 1], 1.5, "#b5faff", "#3f3d32"], [[1, 2], 0.75, "#cfe1e2", "#625b2f"],
            [[2, 1], 2.25, "#76f6ff", "#3f3d32"], [[2, 2], 1.125, "#98d8dd", "#625b2f"],
            [[3, 1], 1.5**3, "#00eeff", "#3f3d32"], [[3, 2], 1.5**3/2, "#40b7bf", "#625b2f"],
            [[4, 1], 1.5**4, "#00c3ff", "#3f3d32"], [[4, 2], 1.5**4/2, "#40a2bf", "#625b2f"],
            [[5, 1], 1.5**5, "#0099ff", "#3f3d32"], [[5, 2], 1.5**5/2, "#408cbf", "#625b2f"],
            [[6, 1], 1.5**6, "#0055ff", "#3f3d32"], [[6, 2], 1.5**6/2, "#406abf", "#625b2f"],
            [[7, 1], 1.5**7, "#0000ff", "#3f3d32"], [[7, 2], 1.5**7/2, "#4040bf", "#625b2f"],
            [[8, 1], 1.5**8, "#ffa2ba", "#3f3d32"], [[8, 2], 1.5**8/2, "#e8bac6", "#625b2f"],
            [[9, 1], 1.5**9, "#ff799a", "#3f3d32"], [[9, 2], 1.5**9/2, "#de9cac", "#625b2f"],
            [[10, 1], 1.5**10, "#ff547e", "#3f3d32"], [[10, 2], 1.5**10/2, "#d47d93", "#625b2f"],
            [[11, 1], 1.5**11, "#ff2d62", "#3f3d32"], [[11, 2], 1.5**11/2, "#cb627c", "#625b2f"],
            [[12, 1], 1.5**12, "#ff0040", "#eeebda"], [[12, 2], 1.5**12/2, "#bf4060", "#e3dbaf"],
            [[13, 1], 1.5**13, "#c20031", "#eeebda"], [[13, 2], 1.5**13/2, "#913049", "#e3dbaf"],
            [[14, 1], 1.5**14, "#ff9f63", "#eeebda"], [[14, 2], 1.5**14/2, "#d7a788", "#e3dbaf"],
            [[15, 1], 1.5**15, "#ff8132", "#eeebda"], [[15, 2], 1.5**15/2, "#cc8d66", "#e3dbaf"],
            [[16, 1], 1.5**16, "#ff6200", "#eeebda"], [[16, 2], 1.5**16/2, "#bf7140", "#e3dbaf"],
            [[17, 1], 1.5**17, "#ff9900", "#eeebda"], [[17, 2], 1.5**17/2, "#bf8c40", "#e3dbaf"],
            [[18, 1], 1.5**18, "#ffc400", "#eeebda"], [[18, 2], 1.5**18/2, "#bfa240", "#e3dbaf"],
            [[19, 1], 1.5**19, "#c49600", "#eeebda"], [[19, 2], 1.5**19/2, "#917b30", "#e3dbaf"],
            [[20, 1], 1.5**20, "#947100", "#eeebda"], [[20, 2], 1.5**20/2, "#6f5e25", "#e3dbaf"],
            [[21, 1], 1.5**21, "#634c00", "#eeebda"], [[21, 2], 1.5**21/2, "#493d18", "#e3dbaf"],
            [["@This 1", "=", 1], [1.5, "^", "@This 0"], ["@HSLA", [13, "*", "@This 0", "-", 151], 100, [0.95, "^", ["@This 0", "-", 21], "*", 50], 1], "#eeebda"],
            [["@This 1", "=", 2], [1.5, "^", "@This 0", "/", 2], ["@HSLA", [13, "*", "@This 0", "-", 151], 50, [0.95, "^", ["@This 0", "-", 21], "*", 50], 1], "#e3dbaf"],
        ];
        MergeRules = [
            [2, [["@Next 1 0", "=", "@This 0"], "&&", ["@This 1", "=", 1], "&&", ["@Next 1 1", "=", 1]], true, [[["@This 0", "+", 1], 1], ["@This 0", 2]], [1.5, "^", "@This 0", "*", 1.5], [false, false]],
            [2, [["@Next 1 0", "=", "@This 0"], "&&", ["@This 1", "=", 2], "&&", ["@Next 1 1", "=", 2]], true, [["@This 0", 1]], [1.5, "^", "@This 0"], [false, true]]
        ];
        startTileSpawns = [[[0, 1], 80], [[0, 2], 10], [[1, 1], 10]];
        winConditions = [[19, 1]];
        winRequirement = 1;
        mode_vars = [1]; // Which of the three versions of this mode are we in?
        document.documentElement.style.setProperty("background-image", "radial-gradient(#af8c00 0%, #fff 150%)");
        document.documentElement.style.setProperty("--background-color", "#dfd1ac");
        document.documentElement.style.setProperty("--grid-color", "#a59772");
        document.documentElement.style.setProperty("--tile-color", "#bba66a");
        document.documentElement.style.setProperty("--text-color", "#3f3d32");
        displayRules("rules_text", ["h2", "Powers of 1.5"], ["h1", "2216.8378200531005859375"], ["p","Merges occur between two tiles that are the same number. Tiles that are a power of 1.5 will only merge partially, with only half of the colliding tile absorbed into the result, so two 1s merge into a 1.5 and a 0.5, while two 1.5s merge into a 2.25 and a 0.75. If the tiles are not powers of 1.5, they merge entirely, so two 0.5s merge into a 1. Get to the 2216.838 (1.5<sup>19</sup>) tile to win!"],
        ["p", "Spawning tiles: 1 (80%), 0.5 (10%), 1.5 (10%)"]);
        displayRules("gm_rules_text", ["h2", "Powers of 1.5"], ["h1", "2216.8378200531005859375"], ["p","Merges occur between two tiles that are the same number. Tiles that are a power of 1.5 will only merge partially, with only half of the colliding tile absorbed into the result, so two 1s merge into a 1.5 and a 0.5, while two 1.5s merge into a 2.25 and a 0.75. If the tiles are not powers of 1.5, they merge entirely, so two 0.5s merge into a 1. Get to the 2216.838 (1.5<sup>19</sup>) tile to win!"],
        ["p", "Spawning tiles: 1 (80%), 0.5 (10%), 1.5 (10%)"]);
        document.getElementById("mode_vars_line").style.setProperty("display", "block");
        document.getElementById("ThreeHalves_vars").style.setProperty("display", "flex");
    }
    else if (mode == 38) { // 180
        width = 7; height = 7; min_dim = 5;
        TileNumAmount = 3;
        TileTypes = [
            [[0, 0, 0], 1, "#000000", "#ffffff"],
            [[["@This 0", "=", "@This 1"], "&&", ["@This 1", "=", "@This 2"]], [[2, "^", "@This 0"], "*", [3, "^", "@This 1"], "*", [5, "^", "@This 2"]], ["@HSVA", 0, 0, [0.85, "^", ["@This 0", "-", 1], "*", 100], 1], ["@HSVA", 0, 0, ["@This 0", "*", 100, "-", 500], 1]],
            [[["@This 0", ">=", "@This 2"], "&&", ["@This 1", ">=", "@This 2"]], [[2, "^", "@This 0"], "*", [3, "^", "@This 1"], "*", [5, "^", "@This 2"]], ["@HSVA", [["@This 1", "-", "@This 2"], "/", ["@This 2", "*", -2, "+", "@This 0", "+", "@This 1"], "*", 120], [0.7, "^", "@This 2", "*", 100], [0.85, "^", [["@This 0", "-", "@This 2"], "gcd", ["@This 1", "-", "@This 2"], "-", 1], "*", 100], 1], ["@HSVA", 0, 0, [[["@This 0", "-", "@This 2"], "gcd", ["@This 1", "-", "@This 2"]], "*", 100, "-", 500], 1]],
            [[["@This 1", ">=", "@This 0"], "&&", ["@This 2", ">=", "@This 0"]], [[2, "^", "@This 0"], "*", [3, "^", "@This 1"], "*", [5, "^", "@This 2"]], ["@HSVA", [["@This 2", "-", "@This 0"], "/", ["@This 0", "*", -2, "+", "@This 1", "+", "@This 2"], "*", 120, "+", 120], [0.7, "^", "@This 0", "*", 100], [0.85, "^", [["@This 1", "-", "@This 0"], "gcd", ["@This 2", "-", "@This 0"], "-", 1], "*", 100], 1], ["@HSVA", 0, 0, [[["@This 1", "-", "@This 0"], "gcd", ["@This 2", "-", "@This 0"]], "*", 100, "-", 500], 1]],
            [[["@This 0", ">=", "@This 1"], "&&", ["@This 2", ">=", "@This 1"]], [[2, "^", "@This 0"], "*", [3, "^", "@This 1"], "*", [5, "^", "@This 2"]], ["@HSVA", [["@This 0", "-", "@This 1"], "/", ["@This 1", "*", -2, "+", "@This 0", "+", "@This 2"], "*", 120, "+", 240], [0.7, "^", "@This 1", "*", 100], [0.85, "^", [["@This 0", "-", "@This 1"], "gcd", ["@This 2", "-", "@This 1"], "-", 1], "*", 100], 1], ["@HSVA", 0, 0, [[["@This 0", "-", "@This 1"], "gcd", ["@This 2", "-", "@This 1"]], "*", 100, "-", 500], 1]],
        ];
        MergeRules = [
            [5, [[["@NextNE -1 0", "!=", "@This 0"], "||", ["@NextNE -1 1", "!=", "@This 1"], "||", ["@NextNE -1 2", "!=", "@This 2"]], "&&", [["@Next 5 0", "!=", "@This 0"], "||", ["@Next 5 1", "!=", "@This 1"], "||", ["@Next 5 2", "!=", "@This 2"]], "&&", ["@Next 1 0", "=", "@This 0"], "&&", ["@Next 1 1", "=", "@This 1"], "&&", ["@Next 1 2", "=", "@This 2"], "&&", ["@Next 2 0", "=", "@This 0"], "&&", ["@Next 2 1", "=", "@This 1"], "&&", ["@Next 2 2", "=", "@This 2"], "&&", ["@Next 3 0", "=", "@This 0"], "&&", ["@Next 3 1", "=", "@This 1"], "&&", ["@Next 3 2", "=", "@This 2"], "&&", ["@Next 4 0", "=", "@This 0"], "&&", ["@Next 4 1", "=", "@This 1"], "&&", ["@Next 4 2", "=", "@This 2"]], true, [["@This 0", "@This 1", ["@This 2", "+", 1]]], [[2, "^", "@This 0"], "*", [3, "^", "@This 1"], "*", [5, "^", "@This 2"], "*", 5], [false, true, true, true, true]],
            [3, [[["@NextNE -1 0", "!=", "@This 0"], "||", ["@NextNE -1 1", "!=", "@This 1"], "||", ["@NextNE -1 2", "!=", "@This 2"]], "&&", [["@Next 3 0", "!=", "@This 0"], "||", ["@Next 3 1", "!=", "@This 1"], "||", ["@Next 3 2", "!=", "@This 2"]], "&&", ["@Next 1 0", "=", "@This 0"], "&&", ["@Next 1 1", "=", "@This 1"], "&&", ["@Next 1 2", "=", "@This 2"], "&&", ["@Next 2 0", "=", "@This 0"], "&&", ["@Next 2 1", "=", "@This 1"], "&&", ["@Next 2 2", "=", "@This 2"]], true, [["@This 0", ["@This 1", "+", 1], "@This 2"]], [[2, "^", "@This 0"], "*", [3, "^", "@This 1"], "*", [5, "^", "@This 2"], "*", 3], [false, true, true]],
            [2, [[["@NextNE -1 0", "!=", "@This 0"], "||", ["@NextNE -1 1", "!=", "@This 1"], "||", ["@NextNE -1 2", "!=", "@This 2"]], "&&", [["@Next 2 0", "!=", "@This 0"], "||", ["@Next 2 1", "!=", "@This 1"], "||", ["@Next 2 2", "!=", "@This 2"]], "&&", ["@Next 1 0", "=", "@This 0"], "&&", ["@Next 1 1", "=", "@This 1"], "&&", ["@Next 1 2", "=", "@This 2"]], true, [[["@This 0", "+", 1], "@This 1", "@This 2"]], [[2, "^", "@This 0"], "*", [3, "^", "@This 1"], "*", [5, "^", "@This 2"], "*", 2], [false, true]],
        ];
        startTileSpawns = [[[0, 0, 0], 100]];
        winConditions = [[2, 2, 1]];
        winRequirement = 1;
        document.documentElement.style.setProperty("background-image", "radial-gradient(#e5e55b 0%, #fff 100%)");
        document.documentElement.style.setProperty("--background-color", "#fffdf1");
        document.documentElement.style.setProperty("--grid-color", "#a8a8a8");
        document.documentElement.style.setProperty("--tile-color", "#cbcbcb");
        document.documentElement.style.setProperty("--text-color", "#484848");
        displayRules("rules_text", ["h2", "5-Smooth Numbers"], ["h1", "180"], ["p", "Merges occur between exactly two, three, or five tiles of the same number - note that a line of four, six, etc. of the same tile will not merge! Get to the 180 tile to win, or see how many different tiles you can discover!"],
        ["p", "Spawning tiles: 1 (100%)"]);
        displayRules("gm_rules_text", ["h2", "5-Smooth Numbers"], ["h1", "180"], ["p", "Merges occur between exactly two, three, or five tiles of the same number - note that a line of four, six, etc. of the same tile will not merge! Get to the 180 tile to win, or see how many different tiles you can discover!"],
        ["p", "Spawning tiles: 1 (100%)"]);
        statBoxes = [["Discovered Tiles", ["@DiscTiles", "arr_length"]], ["Score", "@Score"]];
    }
    else if (mode == 39) { // 2592
        width = 6; height = 6; min_dim = 3;
        TileNumAmount = 2;
        TileTypes = [[true, [[2, "^", "@This 0"], "*", [3, "^", "@This 1"]], ["@HSVA", [["@This 0", "%", 8, "-", 3.5, "abs", "*", -15], "+", ["@This 1", "*", 149], "+", 300], [0.75, "^", ["@This 1", "floor", 5, "/", 5], "*", 100], [0.8, "^", ["@This 0", "floor", 4, "/", 4], "*", 100], 1], "#ffffff"]];
        MergeRules = [
            [3, [["@Next 1 0", "=", "@This 0"], "&&", ["@Next 1 1", "=", "@This 1"], "&&", ["@Next 2 0", "=", "@This 0"], "&&", ["@Next 2 1", "=", "@This 1"], "&&", ["@Moves", "%", 2, "=", 1]], true, [["@This 0", ["@This 1", "+", 1]]], [[2, "^", "@This 0"], "*", [3, "^", "@This 1"], "*", 3], [false, true, true]],
            [2, [["@Next 1 0", "=", "@This 0"], "&&", ["@Next 1 1", "=", "@This 1"], "&&", ["@Moves", "%", 2, "=", 0]], true, [[["@This 0", "+", 1], "@This 1"]], [[2, "^", "@This 0"], "*", [3, "^", "@This 1"], "*", 2], [false, true]]
        ]
        startTileSpawns = [[[0, 0], 90], [[1, 0], 5], [[0, 1], 5]];
        winConditions = [[5, 4]];
        winRequirement = 1;
        mode_vars = [0]; //Controls when the merge rules switch
        document.documentElement.style.setProperty("background-image", "radial-gradient(#00a068 0%, #fff 150%)");
        document.documentElement.style.setProperty("--background-color", "#c3e3d6");
        document.documentElement.style.setProperty("--grid-color", "#7eaa9d");
        document.documentElement.style.setProperty("--tile-color", "#7bd0b7");
        document.documentElement.style.setProperty("--text-color", "#282f2b");
        displayRules("rules_text", ["h2", "3-Smooth Numbers"], ["h1", "2592"], ["p","The merge rules switch on each move. On even-numbered moves, merges occur between two equal tiles. On odd-numbered moves, merges occur between three equal tiles. Get to the 2592 tile to win!"],
        ["p", "Spawning tiles: 1 (90%), 2 (5%), 3 (5%)"]);
        displayRules("gm_rules_text", ["h2", "3-Smooth Numbers"], ["h1", "2592"], ["p","The merge rules switch on each move. On even-numbered moves, merges occur between two equal tiles. On odd-numbered moves, merges occur between three equal tiles. Get to the 2592 tile to win!"],
        ["p", "Spawning tiles: 1 (90%), 2 (5%), 3 (5%)"]);
        statBoxes = [["Discovered Tiles", ["@DiscTiles", "arr_length"]], ["Score", "@Score"]];
        document.getElementById("mode_vars_line").style.setProperty("display", "block");
        document.getElementById("2592_vars").style.setProperty("display", "flex");
    }
    else if (mode == 40) { // Wildcard 2048
        width = 4; height = 4; min_dim = 2;
        mode_vars = [false]; //If this is true, all possibilities of wildcards merge rather than just the shared ones
        document.documentElement.style.setProperty("background-image", "linear-gradient(#f2b179, #ede0c8, #f9eee3, #ffffff, #f9eee3, #ede0c8, #f2b179)");
        document.documentElement.style.setProperty("--background-color", "radial-gradient(#f2b179, #ede0c8, #f9eee3, #ffffff, #f9eee3, #ede0c8, #f2b179)");
        document.documentElement.style.setProperty("--grid-color", "#c7bea7");
        document.documentElement.style.setProperty("--tile-color", "#ece0c2");
        document.documentElement.style.setProperty("--text-color", "#524c46");
        displayRules("rules_text", ["h1", "Wildcard 2048"], ["p", "2048, but some tiles can act as multiple tiles, such as a \"2 4\" tile, which could merge with a 2 to make a 4, or it could merge with a 4 to make an 8. Two of these \"wildcard\" tiles can merge as long as they share at least one possibility, and the result of their merge is a tile that contains all of the possibilities they both had, but doubled since they just merged. For example, a 1 2 4 tile and a 2 4 8 tile share the 2 and 4 possibilities, so they merge into a 4 8 tile. To win, you must make a regular 2048 tile - a tile with 2048 as one of its multiple possibilities doesn't count!"],
        ["p", "Spawning tiles: 1 (35%), 2 (15%), 4 (10%), 1 2 (12%), 1 4 (8%), 2 4 (8%), 1 2 4 (8%). The remaining 4% chance spawns a tile that could be any combination of tiles up to (but not including) the highest power of 2 you've reached, but is biased towards smaller values."]);
        displayRules("gm_rules_text", ["h1", "Wildcard 2048"], ["p", "2048, but some tiles can act as multiple tiles, such as a \"2 4\" tile, which could merge with a 2 to make a 4, or it could merge with a 4 to make an 8. Two of these \"wildcard\" tiles can merge as long as they share at least one possibility, and the result of their merge is a tile that contains all of the possibilities they both had, but doubled since they just merged. For example, a 1 2 4 tile and a 2 4 8 tile share the 2 and 4 possibilities, so they merge into a 4 8 tile. To win, you must make a regular 2048 tile - a tile with 2048 as one of its multiple possibilities doesn't count!"],
        ["p", "Spawning tiles: 1 (35%), 2 (15%), 4 (10%), 1 2 (12%), 1 4 (8%), 2 4 (8%), 1 2 4 (8%). The remaining 4% chance spawns a tile that could be any combination of tiles up to (but not including) the highest power of 2 you've reached, but is biased towards smaller values."]);
        document.getElementById("mode_vars_line").style.setProperty("display", "block");
        document.getElementById("Wildcard2048_vars").style.setProperty("display", "flex");
        if (modifiers[13] == "None") {
            TileNumAmount = 1;
            TileTypes = [ //The powers of 2 could be rendered using the rule for wildcards, but they're given specified types to reduce lag
            [[1], "1", "#89817b", "#f9f6f2"], [[2], "2", "#aa937f", "#f9f6f2"], [[4], "4", "#c69d79", "#f9f6f2"], [[8], "8", "#f2b179", "#f9f6f2"],
            [[16], "16", "#f59563", "#f9f6f2"], [[32], "32", "#f67c5f", "#f9f6f2"], [[64], "64", "#f65e3b", "#f9f6f2"], [[128], "128", "#edcf72", "#f9f6f2"],
            [[256], "256", "#edcc61", "#f9f6f2"], [[512], "512", "#edc850", "#f9f6f2"], [[1024], "1024", "#edc53f", "#f9f6f2"], [[2048], "2048", "#edc22e", "#f9f6f2"],
            [[4096], "4096", "#f29eff", "#f9f6f2"], [[8192], "8192", "#eb75fd", "#f9f6f2"], [[16384], "16384", "#e53bff", "#f9f6f2"],
            [[32768], "32768", "#bd00db", "#f9f6f2"], [[65536], "65536", "#770089", "#f9f6f2"], [[131072], "131072", "#534de8", "#f9f6f2"],
            [[262144], "262144", "#2922e1", "#f9f6f2"], [[524288], "524288", "#0a05b6", "#f9f6f2"],
            [true, [1, "@This 0", "@end_vars", "", "@repeat", ["@var_retain", "@Var 0", "<=", "@Var 1"], "@if", ["@var_retain", "@Var 1", "floor", "@Var 0", "/", "@Var 0", "%", 2, "=", 1], "str_concat", " ", "str_concat", "@Var 0", "@end-if", "@edit_var", 0, ["@var_retain", "@Var 0", "*", 2], "@end-repeat", "str_splice", 0, 1, ""], ["@CalcArray", [1, "@end_vars", ["@Literal"], "@repeat", ["@var_retain", "@Var 0", "<=", "@This 0"], "@if", ["@var_retain", "@This 0", "floor", "@Var 0", "/", "@Var 0", "%", 2, "=", 1], "arr_push", ["@var_retain", "@Var 0", "log", 2, "round", 1], "@end-if", "@edit_var", 0, ["@var_retain", "@Var 0", "*", 2], "@end-repeat"], 0, ["@Literal", "#89817b", "#aa937f", "#c69d79", "#f2b179", "#f59563", "#f67c5f", "#f65e3b", "#edcf72", "#edcc61", "#edc850", "#edc53f", "#edc22e", "#f29eff", "#eb75fd", "#e53bff", "#bd00db", "#770089", "#534de8", "#2922e1", "#0a05b6"], "@end_vars", ["@Literal"], "@repeat", ["@var_retain", "@Var 0", "arr_length"], "@if", ["@var_retain", ["@var_retain", "@Var 0", "arr_elem", "@Var 1"], "<", 20], "arr_concat", ["@var_retain", "@Var 2", "arr_elem", ["@var_retain", "@Var 0", "arr_elem", "@Var 1"]], "@end-if", "@else", "arr_push", ["@var_retain", ["@Literal"], "arr_push", "@HSLA", "arr_push", ["@var_retain", -15, "*", ["@var_retain", "@Var 0", "arr_elem", "@Var 1"], "+", 520], "arr_push", 100, "arr_push", ["@var_retain", 0.9, "^", ["@var_retain", "@Var 0", "arr_elem", "@Var 1", "-", 20], "*", 36], "arr_concat", 1], "@end-else", "arr_concat", ["@var_retain", "@Var 1", "*", 100, "/", ["@var_retain", "@Var 0", "arr_length"]], "arr_concat", ["@var_retain", "@Var 1", "+", 1, "*", 100, "/", ["@var_retain", "@Var 0", "arr_length"]], "@edit_var", 1, ["@var_retain", "@Var 1", "+", 1], "@end-repeat", "arr_concat_front", 90, "arr_concat_front", "@linear-gradient"], "#f9f6f2"]
            ];
            MergeRules = [[[1, "@end_vars", 0, "@repeat", ["@var_retain", "@This 0", "min", "@Next 1 0", ">=", "@Var 0"], "@if", ["@var_retain", ["@var_retain", "@This 0", "floor", "@Var 0", "/", "@Var 0", "%", 2, "=", 1], "&&", ["@var_retain", "@Next 1 0", "floor", "@Var 0", "/", "@Var 0", "%", 2, "=", 1]], "+", "@Var 0", "@end-if", "@edit_var", 0, ["@var_retain", "@Var 0", "*", 2], "@end-repeat"], "@end_vars", 2, ["@var_retain", "@Var 0", ">", 0], true, [[["@var_retain", "@Var 0", "*", 2]]], ["@var_retain", "@Var 0", "*", 2], [false, true]]];
            startTileSpawns = [[[1], 35], [[2], 15], [[4], 10], [[3], 12], [[5], 8], [[6], 8], [[7], 8], [[[2, "^", ["@DiscTiles", "arr_reduce", 0, ["@if", ["@var_retain", "@Var -1", "arr_elem", 0, ">", "@Parent -2"], "2nd", ["@var_retain", "@Var -1", "arr_elem", 0], "@end-if"], "+", 0.5, "log", 2, "floor", 1, "rand_float", 1], "round", 1, "-", 1, "max", 1]], 4]];
            winConditions = [[2048]];
            winRequirement = 1;
        }
        else { //A tile cannot contain both positive and negative possibilities, so "2 -1" is not possible. This restriction was mostly placed to make the code easier to write
            TileNumAmount = 2;
            TileTypes = [
                [[1, 1], "1", "#89817b", "#f9f6f2"], [[2, 1], "2", "#aa937f", "#f9f6f2"], [[4, 1], "4", "#c69d79", "#f9f6f2"],
                [[8, 1], "8", "#f2b179", "#f9f6f2"], [[16, 1], "16", "#f59563", "#f9f6f2"], [[32, 1], "32", "#f67c5f", "#f9f6f2"],
                [[64, 1], "64", "#f65e3b", "#f9f6f2"], [[128, 1], "128", "#edcf72", "#f9f6f2"],  [[256, 1], "256", "#edcc61", "#f9f6f2"],
                [[512, 1], "512", "#edc850", "#f9f6f2"], [[1024, 1], "1024", "#edc53f", "#f9f6f2"], [[2048, 1], "2048", "#edc22e", "#f9f6f2"],
                [[4096, 1], "4096", "#f29eff", "#f9f6f2"], [[8192, 1], "8192", "#eb75fd", "#f9f6f2"], [[16384, 1], "16384", "#e53bff", "#f9f6f2"],
                [[32768, 1], "32768", "#bd00db", "#f9f6f2"], [[65536, 1], "65536", "#770089", "#f9f6f2"], [[131072, 1], "131072", "#534de8", "#f9f6f2"],
                [[262144, 1], "262144", "#2922e1", "#f9f6f2"], [[524288, 1], "524288", "#0a05b6", "#f9f6f2"],
                [["@This 1", "=", 1], [1, "@This 0", "@end_vars", "", "@repeat", ["@var_retain", "@Var 0", "<=", "@Var 1"], "@if", ["@var_retain", "@Var 1", "floor", "@Var 0", "/", "@Var 0", "%", 2, "=", 1], "str_concat", " ", "str_concat", "@Var 0", "@end-if", "@edit_var", 0, ["@var_retain", "@Var 0", "*", 2], "@end-repeat", "str_splice", 0, 1, ""], ["@CalcArray", [1, "@end_vars", ["@Literal"], "@repeat", ["@var_retain", "@Var 0", "<=", "@This 0"], "@if", ["@var_retain", "@This 0", "floor", "@Var 0", "/", "@Var 0", "%", 2, "=", 1], "arr_push", ["@var_retain", "@Var 0", "log", 2, "round", 1], "@end-if", "@edit_var", 0, ["@var_retain", "@Var 0", "*", 2], "@end-repeat"], 0, ["@Literal", "#89817b", "#aa937f", "#c69d79", "#f2b179", "#f59563", "#f67c5f", "#f65e3b", "#edcf72", "#edcc61", "#edc850", "#edc53f", "#edc22e", "#f29eff", "#eb75fd", "#e53bff", "#bd00db", "#770089", "#534de8", "#2922e1", "#0a05b6"], "@end_vars", ["@Literal"], "@repeat", ["@var_retain", "@Var 0", "arr_length"], "@if", ["@var_retain", ["@var_retain", "@Var 0", "arr_elem", "@Var 1"], "<", 20], "arr_concat", ["@var_retain", "@Var 2", "arr_elem", ["@var_retain", "@Var 0", "arr_elem", "@Var 1"]], "@end-if", "@else", "arr_push", ["@var_retain", ["@Literal"], "arr_push", "@HSLA", "arr_push", ["@var_retain", -15, "*", ["@var_retain", "@Var 0", "arr_elem", "@Var 1"], "+", 520], "arr_push", 100, "arr_push", ["@var_retain", 0.9, "^", ["@var_retain", "@Var 0", "arr_elem", "@Var 1", "-", 20], "*", 36], "arr_concat", 1], "@end-else", "arr_concat", ["@var_retain", "@Var 1", "*", 100, "/", ["@var_retain", "@Var 0", "arr_length"]], "arr_concat", ["@var_retain", "@Var 1", "+", 1, "*", 100, "/", ["@var_retain", "@Var 0", "arr_length"]], "@edit_var", 1, ["@var_retain", "@Var 1", "+", 1], "@end-repeat", "arr_concat_front", 90, "arr_concat_front", "@linear-gradient"], "#f9f6f2"],
                [[1, -1], "-1", "#767e84", "#06090d"], [[2, -1], "-2", "#556c80", "#06090d"], [[4, -1], "-4", "#396286", "#06090d"],
                [[8, -1], "-8", "#0d4e86", "#06090d"], [[16, -1], "-16", "#0a6a9c", "#06090d"], [[32, -1], "-32", "#0983a0", "#06090d"],
                [[64, -1], "-64", "#09a1c4", "#06090d"], [[128, -1], "-128", "#12308d", "#06090d"], [[256, -1], "-256", "#12339e", "#06090d"],
                [[512, -1], "-512", "#1237af", "#06090d"], [[1024, -1], "-1024", "#123ac0", "#06090d"], [[2048, -1], "-2048", "#123dd1", "#06090d"],
                [[4096, -1], "-4096", "#0d6100", "#06090d"], [[8192, -1], "-8192", "#148a02", "#06090d"], [[16384, -1], "-16384", "#1ac400", "#06090d"],
                [[32768, -1], "-32768", "#42ff24", "#06090d"], [[65536, -1], "-65536", "#88ff76", "#06090d"], [[131072, -1], "-131072", "#acb217", "#06090d"],
                [[262144, -1], "-262144", "#d6dd1e", "#06090d"], [[524288, -1], "-524288", "#f5fa49", "#06090d"],
                [["@This 1", "=", -1], [1, "@This 0", "@end_vars", "", "@repeat", ["@var_retain", "@Var 0", "<=", "@Var 1"], "@if", ["@var_retain", "@Var 1", "floor", "@Var 0", "/", "@Var 0", "%", 2, "=", 1], "str_concat", " ", "str_concat", ["@var_retain", "@Var 0", "*", -1], "@end-if", "@edit_var", 0, ["@var_retain", "@Var 0", "*", 2], "@end-repeat", "str_splice", 0, 1, ""], ["@CalcArray", [1, "@end_vars", ["@Literal"], "@repeat", ["@var_retain", "@Var 0", "<=", "@This 0"], "@if", ["@var_retain", "@This 0", "floor", "@Var 0", "/", "@Var 0", "%", 2, "=", 1], "arr_push", ["@var_retain", "@Var 0", "log", 2, "round", 1], "@end-if", "@edit_var", 0, ["@var_retain", "@Var 0", "*", 2], "@end-repeat"], 0, ["@Literal", "#767e84", "#556c80", "#396286", "#0d4e86", "#0a6a9c", "#0983a0", "#09a1c4", "#12308d", "#12339e", "#1237af", "#123ac0", "#123dd1", "#0d6100", "#148a02", "#1ac400", "#42ff24", "#88ff76", "#acb217", "#d6dd1e", "#f5fa49"], "@end_vars", ["@Literal"], "@repeat", ["@var_retain", "@Var 0", "arr_length"], "@if", ["@var_retain", ["@var_retain", "@Var 0", "arr_elem", "@Var 1"], "<", 20], "arr_concat", ["@var_retain", "@Var 2", "arr_elem", ["@var_retain", "@Var 0", "arr_elem", "@Var 1"]], "@end-if", "@else", "arr_push", ["@var_retain", ["@Literal"], "arr_push", "@HSLA", "arr_push", ["@var_retain", -15, "*", ["@var_retain", "@Var 0", "arr_elem", "@Var 1"], "+", 340], "arr_push", 100, "arr_push", ["@var_retain", 100, "-", ["@var_retain", 0.9, "^", ["@var_retain", "@Var 0", "arr_elem", "@Var 1", "-", 20], "*", 36]], "arr_concat", 1], "@end-else", "arr_concat", ["@var_retain", "@Var 1", "*", 100, "/", ["@var_retain", "@Var 0", "arr_length"]], "arr_concat", ["@var_retain", "@Var 1", "+", 1, "*", 100, "/", ["@var_retain", "@Var 0", "arr_length"]], "@edit_var", 1, ["@var_retain", "@Var 1", "+", 1], "@end-repeat", "arr_concat_front", 90, "arr_concat_front", "@linear-gradient"], "#06090d"]
            ];
            MergeRules = [[[1, "@end_vars", 0, "@repeat", ["@var_retain", "@This 0", "min", "@Next 1 0", ">=", "@Var 0"], "@if", ["@var_retain", ["@var_retain", "@This 0", "floor", "@Var 0", "/", "@Var 0", "%", 2, "=", 1], "&&", ["@var_retain", "@Next 1 0", "floor", "@Var 0", "/", "@Var 0", "%", 2, "=", 1]], "+", "@Var 0", "@end-if", "@edit_var", 0, ["@var_retain", "@Var 0", "*", 2], "@end-repeat"], "@end_vars", 2, ["@var_retain", "@Var 0", ">", 0, "&&", ["@This 1", "=", "@Next 1 1"]], true, [[["@var_retain", "@Var 0", "*", 2], "@This 1"]], ["@var_retain", "@Var 0", "*", 2], [false, true]]];
            if (modifiers[13] == "Interacting") MergeRules.push([[1, "@end_vars", 0, "@repeat", ["@var_retain", "@This 0", "min", "@Next 1 0", ">=", "@Var 0"], "@if", ["@var_retain", ["@var_retain", "@This 0", "floor", "@Var 0", "/", "@Var 0", "%", 2, "=", 1], "&&", ["@var_retain", "@Next 1 0", "floor", "@Var 0", "/", "@Var 0", "%", 2, "=", 1]], "+", "@Var 0", "@end-if", "@edit_var", 0, ["@var_retain", "@Var 0", "*", 2], "@end-repeat"], "@end_vars", 2, ["@var_retain", "@Var 0", ">", 0, "&&", ["@This 1", "!=", "@Next 1 1"]], true, [], 0, [true, true]]);
            startTileSpawns = [[[1, 1], 35], [[2, 1], 15], [[4, 1], 10], [[3, 1], 12], [[5, 1], 8], [[6, 1], 8], [[7, 1], 8], [[[2, "^", ["@DiscTiles", "arr_reduce", 0, ["@if", ["@var_retain", "@Var -1", "arr_elem", 0, ">", "@Parent -2"], "2nd", ["@var_retain", "@Var -1", "arr_elem", 0], "@end-if"], "+", 0.5, "log", 2, "floor", 1, "rand_float", 1], "round", 1, "-", 1, "max", 1], 1], 4], [[1, -1], 35], [[2, -1], 15], [[4, -1], 10], [[3, -1], 12], [[5, -1], 8], [[6, -1], 8], [[7, -1], 8], [[[2, "^", ["@DiscTiles", "arr_reduce", 0, ["@if", ["@var_retain", "@Var -1", "arr_elem", 0, ">", "@Parent -2"], "2nd", ["@var_retain", "@Var -1", "arr_elem", 0], "@end-if"], "+", 0.5, "log", 2, "floor", 1, "rand_float", 1], "round", 1, "-", 1, "max", 1], -1], 4]];
            winConditions = [[2048, 1], [2048, -1]];
            winRequirement = 2;
        }
    }
    else if (mode == 41) { // X^Y
        width = 5; height = 5; min_dim = 4;
        mode_vars = [Infinity, 4]; //mode_vars[0] is the maximum prime power, mode_vars[1] is the maximum merge length
        document.documentElement.style.setProperty("background-image", "linear-gradient(#660000, #664e00, #1d6600, #00664e, #005866, #003366, #050066, #3f0066)");
        document.documentElement.style.setProperty("--background-color", "radial-gradient(#000000, #4c0000, #775800, #3ca400, #00d4c9, #0020f2 110%)");
        document.documentElement.style.setProperty("--grid-color", "#272727");
        document.documentElement.style.setProperty("--tile-color", "#494949");
        document.documentElement.style.setProperty("--text-color", "#d5d5d5");
        displayRules("rules_text", ["h2", "All Perfect Powers"], ["h1", "X<sup>Y</sup>"], ["p", "Any two, three, or four tiles can merge as long as those tiles add up to a perfect power, i.e. any number that can be represented as x<sup>y</sup> with x being a positive integer and y being a positive integer above 1. To win, make at least twelve different tiles that are cubes, fourth powers, or higher. The real quest, though, is to discover as many tiles as you can."],
        ["p", "Spawning tiles: 1 (100%)"]);
        displayRules("gm_rules_text", ["h2", "All Perfect Powers"], ["h1", "X<sup>Y</sup>"], ["p", "Any two, three, or four tiles can merge as long as those tiles add up to a perfect power, i.e. any number that can be represented as x<sup>y</sup> with x being a positive integer and y being a positive integer above 1. To win, make at least twelve different tiles that are perfect cubes, fourth powers, or higher. The real quest, though, is to discover as many tiles as you can."],
        ["p", "Spawning tiles: 1 (100%)"]);
        statBoxes = [["Discovered Tiles", ["@DiscTiles", "arr_length"]], ["Score", "@Score"], ["Discovered Winning Tiles", ["@DiscWinning", "arr_length"]]];
        document.getElementById("mode_vars_line").style.setProperty("display", "block");
        document.getElementById("XpowY_vars").style.setProperty("display", "flex");
        if (modifiers[13] == "None") {
            TileNumAmount = 2;
            start_game_vars = [["@Literal", [["@This 0", "^", "@This 1", "+", ["@Next", "arr_reduce", 0, ["+", ["@var_retain", ["@var_retain", "@Var -1", "arr_elem", 0], "^", ["@var_retain", "@Var -1", "arr_elem", 1]]]]], ["@var_retain", 1, "@if", ["@var_retain", "@Var 0", ">", 1], "2nd", "@Var 0", "log", 2, "ceil", 1, "@end-if"], 2, true, "@end_vars", 0, "@if", ["@var_retain", "@Var 0", "<=", 1], "@edit_var", 2, "@Var 0", "@edit_var", 1, 1.5, "@end-if", "@else", "@repeat", ["@var_retain", "@Var 1", ">=", 2, "&&", "@Var 3"], "@edit_var", 2, ["@var_retain", "@Var 0", "^", ["@var_retain", 1, "/", "@Var 1"], "floor", 1], "@if", ["@var_retain", "@Var 2", "^", "@Var 1", "=", "@Var 0"], "@edit_var", 3, false, "@end-if", "@else", "@edit_var", 2, ["@var_retain", "@Var 2", "+", 1], "@if", ["@var_retain", "@Var 2", "^", "@Var 1", "=", "@Var 0"], "@edit_var", 3, false, "@end-if", "@else", "@edit_var", 1, ["@var_retain", "@Var 1", "-", 1], "@end-else", "@end-else", "@end-repeat", "@if", ["@var_retain", "@Var 1", "=", 1], "@edit_var", 2, 0, "@end-if", "@end-else", "2nd", "@Var 2", "arr_push", "@Var 1"]]]; //When the "@Literal" is removed, this becomes a CalcArray expression that calculates the perfect power form of a number, so 25 becomes [5, 2] and 128 becomes [2, 7]. Higher exponents are prioritized, so 64 becomes [2, 6] rather than [4, 3] or [8, 2]. Numbers that are not perfect powers return [0, 1]. 0 and 1 themselves return [0, 1.5] and [1, 1.5]. This expression is used as a variable so each merge rule only has to compute it once per merge attempt instead of several times.
            TileTypes = [
                [[1, 1], 1, "#000000", "#ffffff"],
                [["@This 1", "<", 7], ["@This 0", "^", "@This 1"], ["@HSVA", ["@This 0", "+", 4, "log", 2, "-", [6, "log", 2], "*", 240], [0.7, "^", ["@This 0", "+", 4, "log", 2, "-", [6, "log", 2]], "*", 100], [0.75, "^", "@This 1", "*", -100, "+", 100], 1], ["@HSVA", ["@This 1", "-", 2, "*", 49], 25, 100, 1]],
                [["@This 1", ">=", 7], ["@This 0", "^", "@This 1"], ["@HSVA", ["@This 0", "+", 4, "log", 2, "-", [6, "log", 2], "*", 240], [0.7, "^", ["@This 0", "+", 4, "log", 2, "-", [6, "log", 2]], "*", 100], [0.75, "^", "@This 1", "*", -100, "+", 100], 1], ["@HSVA", ["@This 1", "-", 2, "*", 49], 100, [0.95, "^", ["@This 1", "-", 9], "*", 40], 1]],
            ];
            MergeRules = [
                [["@include_gvars", "@Var 0", "CalcArray"], "@end_vars", 2, ["@var_retain", "@Var 0", "arr_elem", 1, ">", 1, "&&", ["@This 0", "typeof", "=", "number"], "&&", ["@Next", "arr_reduce", true, ["@if", ["@var_retain", "@Var -1", "arr_elem", 0, "typeof", "!=", "number"], "2nd", false, "@end-if"]]], true, [[["@var_retain", "@Var 0", "arr_elem", 0], ["@var_retain", "@Var 0", "arr_elem", 1]]], ["@var_retain", ["@var_retain", "@Var 0", "arr_elem", 0], "^", ["@var_retain", "@Var 0", "arr_elem", 1]], [], 2, [0, 0], 1, 4]
            ]
            startTileSpawns = [[[1, 1], 100]];
            winConditions = [[["@This 1", ">=", 3]]];
            winRequirement = 12;
        }
        else { // If Negative Tiles is Non-Interacting, then positives and negatives can't interact with each other, as usual. If Negative Tiles is Interacting, then positive and negative tiles in this mode can freely add under the rules of the mode; for example, a 25 tile and a -9 tile can merge into a 16 tile.
            TileNumAmount = 3;
            TileTypes = [
                [[1, 1, 1], 1, "#000000", "#ffffff"],
                [[["@This 1", "<", 7], "&&", ["@This 2", "=", 1]], ["@This 0", "^", "@This 1"], ["@HSVA", ["@This 0", "+", 4, "log", 2, "-", [6, "log", 2], "*", 240], [0.7, "^", ["@This 0", "+", 4, "log", 2, "-", [6, "log", 2]], "*", 100], [0.75, "^", "@This 1", "*", -100, "+", 100], 1], ["@HSVA", ["@This 1", "-", 2, "*", 49], 25, 100, 1]],
                [[["@This 1", ">=", 7], "&&", ["@This 2", "=", 1]], ["@This 0", "^", "@This 1"], ["@HSVA", ["@This 0", "+", 4, "log", 2, "-", [6, "log", 2], "*", 240], [0.7, "^", ["@This 0", "+", 4, "log", 2, "-", [6, "log", 2]], "*", 100], [0.75, "^", "@This 1", "*", -100, "+", 100], 1], ["@HSVA", ["@This 1", "-", 2, "*", 49], 100, [0.95, "^", ["@This 1", "-", 9], "*", 40], 1]],
                [[1, 1, -1], -1, "#ffffff", "#000000"],
                [[["@This 1", "<", 7], "&&", ["@This 2", "=", -1]], ["@This 0", "^", "@This 1", "*", -1], ["@rotate", 180, true, ["@HSVA", ["@This 0", "+", 4, "log", 2, "-", [6, "log", 2], "*", 240], [0.7, "^", ["@This 0", "+", 4, "log", 2, "-", [6, "log", 2]], "*", 100], [0.75, "^", "@This 1", "*", -100, "+", 100], 1]], ["@rotate", 180, true, ["@HSVA", ["@This 1", "-", 2, "*", 49], 25, 100, 1]]],
                [[["@This 1", ">=", 7], "&&", ["@This 2", "=", -1]], ["@This 0", "^", "@This 1", "*", -1], ["@rotate", 180, true, ["@HSVA", ["@This 0", "+", 4, "log", 2, "-", [6, "log", 2], "*", 240], [0.7, "^", ["@This 0", "+", 4, "log", 2, "-", [6, "log", 2]], "*", 100], [0.75, "^", "@This 1", "*", -100, "+", 100], 1]], ["@rotate", 180, true, ["@HSVA", ["@This 1", "-", 2, "*", 49], 100, [0.95, "^", ["@This 1", "-", 9], "*", 40], 1]]],
            ];
            startTileSpawns = [[[1, 1, 1], 100], [[1, 1, -1], 100]];
            winConditions = [[["@This 1", ">=", 3]]];
            winRequirement = 24;
            start_game_vars = [["@Literal", [["@This 0", "^", "@This 1", "*", "@This 2", "+", ["@Next", "arr_reduce", 0, ["+", ["@var_retain", ["@var_retain", "@Var -1", "arr_elem", 0], "^", ["@var_retain", "@Var -1", "arr_elem", 1], "*", ["@var_retain", "@Var -1", "arr_elem", 2]]]]], ["@var_retain", 1, "@if", ["@var_retain", "@Var 0", "abs", ">", 1], "2nd", "@Var 0", "abs", "log", 2, "ceil", 1, "@end-if"], 2, true, "@end_vars", 0, "@if", ["@var_retain", "@Var 0", "abs", "<=", 1], "@edit_var", 2, ["@var_retain", "@Var 0", "abs"], "@edit_var", 1, 1.5, "@end-if", "@else", "@repeat", ["@var_retain", "@Var 1", ">=", 2, "&&", "@Var 3"], "@edit_var", 2, ["@var_retain", "@Var 0", "abs", "^", ["@var_retain", 1, "/", "@Var 1"], "floor", 1], "@if", ["@var_retain", "@Var 2", "^", "@Var 1", "=", ["@var_retain", "@Var 0", "abs"]], "@edit_var", 3, false, "@end-if", "@else", "@edit_var", 2, ["@var_retain", "@Var 2", "+", 1], "@if", ["@var_retain", "@Var 2", "^", "@Var 1", "=", ["@var_retain", "@Var 0", "abs"]], "@edit_var", 3, false, "@end-if", "@else", "@edit_var", 1, ["@var_retain", "@Var 1", "-", 1], "@end-else", "@end-else", "@end-repeat", "@if", ["@var_retain", "@Var 1", "=", 1], "@edit_var", 2, 0, "@end-if", "@end-else", "2nd", "@Var 2", "arr_push", "@Var 1", "arr_push", ["@var_retain", "@Var 0", "sign"]]]];
            if (modifiers[13] == "Interacting") {
                MergeRules = [
                    [["@include_gvars", "@Var 0", "CalcArray"], "@end_vars", 2, ["@var_retain", "@Var 0", "arr_elem", 0, "=", 0, "&&", ["@var_retain", "@Var 0", "arr_elem", 1, ">", 1], "&&", ["@This 0", "typeof", "=", "number"], "&&", ["@Next", "arr_reduce", true, ["@if", ["@var_retain", "@Var -1", "arr_elem", 0, "typeof", "!=", "number"], "2nd", false, "@end-if"]]], true, [], 0, [], 2, [0, 0], 1, 4],
                    [["@include_gvars", "@Var 0", "CalcArray"], "@end_vars", 2, ["@var_retain", "@Var 0", "arr_elem", 0, "!=", 0, "&&", ["@var_retain", "@Var 0", "arr_elem", 1, ">", 1], "&&", ["@This 0", "typeof", "=", "number"], "&&", ["@Next", "arr_reduce", true, ["@if", ["@var_retain", "@Var -1", "arr_elem", 0, "typeof", "!=", "number"], "2nd", false, "@end-if"]]], true, [[["@var_retain", "@Var 0", "arr_elem", 0], ["@var_retain", "@Var 0", "arr_elem", 1, "floor", 1], ["@var_retain", "@Var 0", "arr_elem", 2]]], ["@var_retain", ["@var_retain", "@Var 0", "arr_elem", 0], "^", ["@var_retain", "@Var 0", "arr_elem", 1, "floor", 1]], [], 2, [0, 0], 1, 4]
                ]
            }
            else {
                MergeRules = [
                    [["@include_gvars", "@Var 0", "CalcArray"], "@end_vars", 2, ["@var_retain", "@Var 0", "arr_elem", 1, ">", 1, "&&", ["@This 0", "typeof", "=", "number"], "&&", ["@Next", "arr_reduce", true, ["@if", ["@var_retain", "@Var -1", "arr_elem", 0, "typeof", "!=", "number"], "2nd", false, "@end-if"]], "&&", ["@Next", "arr_reduce", true, ["@if", ["@var_retain", "@Var -1", "arr_elem", 2, "!=", "@This 2"], "2nd", false, "@end-if"]]], true, [[["@var_retain", "@Var 0", "arr_elem", 0], ["@var_retain", "@Var 0", "arr_elem", 1], "@This 2"]], ["@var_retain", ["@var_retain", "@Var 0", "arr_elem", 0], "^", ["@var_retain", "@Var 0", "arr_elem", 1]], [], 2, [0, 0], 1, 4]
                ]
            }
        }
    }
    else if (mode == 42) { // Bicolor 2584
        width = 4; height = 4; min_dim = 2;
        TileNumAmount = 2;
        TileTypes = [
        [[0, 0], 1, "#ffffff", "#2d2b31"], [[1, 0], 2, "#b3ffe8", "#2d2b31"],
        [[2, -1], 3, ["@linear-gradient", "#30ffff", 0, "#52ffcb", 25, 75, "#30ffff", 100], "#2d2b31"],
        [[2, 1], 3, ["@linear-gradient", "#ffff30", 0, "#52ffcb", 25, 75, "#ffff30", 100], "#2d2b31"],
        [[3, -1], 5, ["@linear-gradient", "#30ffff", 0, "#00ff99", 25, 75, "#30ffff", 100], "#2d2b31"],
        [[3, 1], 5, ["@linear-gradient", "#ffff30", 0, "#00ff99", 25, 75, "#ffff30", 100], "#2d2b31"],
        [[4, -1], 8, ["@linear-gradient", "#30ffff", 0, "#00c777", 25, 75, "#30ffff", 100], "#2d2b31"],
        [[4, 1], 8, ["@linear-gradient", "#ffff30", 0, "#00c777", 25, 75, "#ffff30", 100], "#2d2b31"],
        [[5, -1], 13, ["@linear-gradient", "#30ffff", 0, "#008b53", 25, 75, "#30ffff", 100], "#2d2b31"],
        [[5, 1], 13, ["@linear-gradient", "#ffff30", 0, "#008b53", 25, 75, "#ffff30", 100], "#2d2b31"],
        [[6, -1], 21, ["@linear-gradient", "#30ffff", 0, "#008b00", 25, 75, "#30ffff", 100], "#2d2b31"],
        [[6, 1], 21, ["@linear-gradient", "#ffff30", 0, "#008b00", 25, 75, "#ffff30", 100], "#2d2b31"],
        [[7, -1], 34, ["@linear-gradient", "#30ffff", 0, "#00e200", 25, 75, "#30ffff", 100], "#2d2b31"],
        [[7, 1], 34, ["@linear-gradient", "#ffff30", 0, "#00e200", 25, 75, "#ffff30", 100], "#2d2b31"],
        [[8, -1], 55, ["@linear-gradient", "#30ffff", 0, "#4aff4a", 25, 75, "#30ffff", 100], "#2d2b31"],
        [[8, 1], 55, ["@linear-gradient", "#ffff30", 0, "#4aff4a", 25, 75, "#ffff30", 100], "#2d2b31"],
        [[9, -1], 89, ["@linear-gradient", "#30ffff", 0, "#94ff94", 25, 75, "#30ffff", 100], "#2d2b31"],
        [[9, 1], 89, ["@linear-gradient", "#ffff30", 0, "#94ff94", 25, 75, "#ffff30", 100], "#2d2b31"],
        [[10, -1], 144, ["@linear-gradient", "#30ffff", 0, "#8ac4ff", 25, 75, "#30ffff", 100], "#dddbe1"],
        [[10, 1], 144, ["@linear-gradient", "#ffff30", 0, "#8ac4ff", 25, 75, "#ffff30", 100], "#dddbe1"],
        [[11, -1], 233, ["@linear-gradient", "#30ffff", 0, "#50a8ff", 25, 75, "#30ffff", 100], "#dddbe1"],
        [[11, 1], 233, ["@linear-gradient", "#ffff30", 0, "#50a8ff", 25, 75, "#ffff30", 100], "#dddbe1"],
        [[12, -1], 377, ["@linear-gradient", "#30ffff", 0, "#0180ff", 25, 75, "#30ffff", 100], "#dddbe1"],
        [[12, 1], 377, ["@linear-gradient", "#ffff30", 0, "#0180ff", 25, 75, "#ffff30", 100], "#dddbe1"],
        [[13, -1], 610, ["@linear-gradient", "#30ffff", 0, "#0055a9", 25, 75, "#30ffff", 100], "#dddbe1"],
        [[13, 1], 610, ["@linear-gradient", "#ffff30", 0, "#0055a9", 25, 75, "#ffff30", 100], "#dddbe1"],
        [[14, -1], 987, ["@linear-gradient", "#30ffff", 0, "#0030a9", 25, 75, "#30ffff", 100], "#dddbe1"],
        [[14, 1], 987, ["@linear-gradient", "#ffff30", 0, "#0030a9", 25, 75, "#ffff30", 100], "#dddbe1"],
        [[15, -1], 1597, ["@linear-gradient", "#30ffff", 0, "#2d0087", 25, 75, "#30ffff", 100], "#dddbe1"],
        [[15, 1], 1597, ["@linear-gradient", "#ffff30", 0, "#2d0087", 25, 75, "#ffff30", 100], "#dddbe1"],
        [[16, -1], 2584, ["@linear-gradient", "#30ffff", 0, "#1a004f", 25, 75, "#30ffff", 100], "#dddbe1"],
        [[16, 1], 2584, ["@linear-gradient", "#ffff30", 0, "#1a004f", 25, 75, "#ffff30", 100], "#dddbe1"],
        [[17, -1], 4181, ["@linear-gradient", "#30ffff", 0, "#3d004f", 25, 75, "#30ffff", 100], "#dddbe1"],
        [[17, 1], 4181, ["@linear-gradient", "#ffff30", 0, "#3d004f", 25, 75, "#ffff30", 100], "#dddbe1"],
        [[18, -1], 6765, ["@linear-gradient", "#30ffff", 0, "#750099", 25, 75, "#30ffff", 100], "#dddbe1"],
        [[18, 1], 6765, ["@linear-gradient", "#ffff30", 0, "#750099", 25, 75, "#ffff30", 100], "#dddbe1"],
        [[19, -1], 10946, ["@linear-gradient", "#30ffff", 0, "#c300ff", 25, 75, "#30ffff", 100], "#dddbe1"],
        [[19, 1], 10946, ["@linear-gradient", "#ffff30", 0, "#c300ff", 25, 75, "#ffff30", 100], "#dddbe1"],
        [[20, -1], 17711, ["@linear-gradient", "#30ffff", 0, "#d85aff", 25, 75, "#30ffff", 100], "#dddbe1"],
        [[20, 1], 17711, ["@linear-gradient", "#ffff30", 0, "#d85aff", 25, 75, "#ffff30", 100], "#dddbe1"],
        [[21, -1], 28657, ["@linear-gradient", "#30ffff", 0, "#e591ff", 25, 75, "#30ffff", 100], "#dddbe1"],
        [[21, 1], 28657, ["@linear-gradient", "#ffff30", 0, "#e591ff", 25, 75, "#ffff30", 100], "#dddbe1"],
        [["@This 1", "=", -1], [[((1 + Math.sqrt(5))/2), "^", ["@This 0", "+", 2]], "-", [((1 + Math.sqrt(5))/-2), "^", ["@This 0", "*", -1, "-", 2]], "/", Math.sqrt(5), "round", 1], ["@linear-gradient", "#30ffff", 0, ["@HSLA", [6.5, "*", "@This 0", "+", 157], [0.99, "^", ["@This 0", "-", 22], "*", 100], ["@This 0", "-", 21, "%", 9, "*", -1, "+", 4, "abs", "*", 10, "+", 30], 1], 25, 75, "#30ffff", 100], "#2d2b31"],
        [["@This 1", "=", 1], [[((1 + Math.sqrt(5))/2), "^", ["@This 0", "+", 2]], "-", [((1 + Math.sqrt(5))/-2), "^", ["@This 0", "*", -1, "-", 2]], "/", Math.sqrt(5), "round", 1], ["@linear-gradient", "#ffff30", 0, ["@HSLA", [6.5, "*", "@This 0", "+", 157], [0.99, "^", ["@This 0", "-", 22], "*", 100], ["@This 0", "-", 21, "%", 9, "*", -1, "+", 4, "abs", "*", 10, "+", 30], 1], 25, 75, "#ffff30", 100], "#2d2b31"],
        ];
        MergeRules = [
            [2, [["@Next 1 0", "=", 0], "&&", ["@This 0", "=", 0]], true, [[1, 0]], 2, [false, true]],
            [2, [["@Next 1 0", "=", 1], "&&", ["@This 0", "=", 0]], true, [[2, 1]], 3, [false, true]],
            [2, [["@Next 1 0", "=", 0], "&&", ["@This 0", "=", 1]], true, [[2, -1]], 3, [false, true]],
            [2, [["@Next 1 0", "=", 1], "&&", ["@This 0", "=", 2]], false, [[3, "@This 1"]], 5, [false, true]],
            [2, [["@This 0", "-", 1, "=", "@Next 1 0"], "&&", ["@This 1", "!=", "@Next 1 1"]], false, [[["@This 0", "+", 1], "@This 1"]], [[((1 + Math.sqrt(5))/2), "^", ["@This 0", "+", 3]], "-", [((1 + Math.sqrt(5))/-2), "^", ["@This 0", "*", -1, "-", 3]], "/", Math.sqrt(5), "round", 1], [false, true]]
        ];
        startTileSpawns = [[[0, 0], 85], [[1, 0], 10], [[2, -1], 2.5], [[2, 1], 2.5]];
        winConditions = [["@This 0", "=", 16]];
        winRequirement = 1;
        document.documentElement.style.setProperty("background-image", "linear-gradient(#80ffff 0%, #6637a8 25% 75%, #ffff80 100%)");
        document.documentElement.style.setProperty("--background-color", "linear-gradient(#bbffff 0%, #b184ee 25% 75%, #ffffbb 100%)");
        document.documentElement.style.setProperty("--grid-color", "#645f71");
        document.documentElement.style.setProperty("--tile-color", "#9f94b4");
        document.documentElement.style.setProperty("--text-color", "#2d2b31");
        displayRules("rules_text", ["h1", "Bicolor 2584"], ["p", "2584 mode, except every tile above 2 comes in two colors. When a 2 and a 1 merge, they become a cyan 3 if the 2 collided into the 1, but they become a yellow 3 if the 1 collided into the 2. 5s retain the color of the 3 used to make them. Merges between two tiles that both have a color can only occur if they're opposite colors, and the color of the larger tile in the merge is retained by the resulting tile. Get to either 2584 tile to win!"],
        ["p", "Spawning tiles: 1 (85%), 2 (10%), Cyan 3 (2.5%), Yellow 3 (2.5%)"]);
        displayRules("gm_rules_text", ["h1", "Bicolor 2584"], ["p", "2584 mode, except every tile above 2 comes in two colors. When a 2 and a 1 merge, they become a cyan 3 if the 2 collided into the 1, but they become a yellow 3 if the 1 collided into the 2. 5s retain the color of the 3 used to make them. Merges between two tiles that both have a color can only occur if they're opposite colors, and the color of the larger tile in the merge is retained by the resulting tile. Get to either 2584 tile to win!"],
        ["p", "Spawning tiles: 1 (85%), 2 (10%), Cyan 3 (2.5%), Yellow 3 (2.5%)"]);
    }
    else if (mode == 43) { // 1321
        width = 5; height = 5; min_dim = 2;
        TileNumAmount = 2;
        if (modifiers[13] == "None") {
            TileTypes = [
                [[1, 0], 1, "#ffffff", "#2f332f"],
                [[["@This 0", "expomod", 2, "<", 5], "&&", ["@This 1", "=", 0]], "@This 0", ["@HSLA", [["@This 0", "/", [2, "^", ["@This 0", "expomod", 2]]], "+", 15, "log", 2, "-", 4, "*", 300], [0.9, "^", [["@This 0", "/", [2, "^", ["@This 0", "expomod", 2]]], "log", 2], "*", 100], ["@This 0", "expomod", 2, "*", -100, "/", 12, "+", 90], 1], "#2f332f"],
                [[["@This 0", "expomod", 2, ">=", 5], "&&", ["@This 1", "=", 0]], "@This 0", ["@HSLA", [["@This 0", "/", [2, "^", ["@This 0", "expomod", 2]]], "+", 15, "log", 2, "-", 4, "*", 300], [0.9, "^", [["@This 0", "/", [2, "^", ["@This 0", "expomod", 2]]], "log", 2], "*", 100], [0.85, "^", ["@This 0", "expomod", 2, "-", 5], "*", 50], 1], "#deeedd"],
                [[1, 1], "+1", ["@multi-gradient", ["@radial-gradient", "#ffffff", "#fff8"], ["@conic-gradient", "#ff0000", "#ffff00", "#00ff00", "#00ffff", "#0000ff", "#ff00ff", "#ff0000"]], "#2f332f"],
                [[["@This 0", "expomod", 2, "<", 5], "&&", ["@This 1", "=", 1]], ["+", "str_concat", ["@This 0", "defaultAbbrev"]], ["@multi-gradient", ["@radial-gradient", ["@HSLA", [["@This 0", "/", [2, "^", ["@This 0", "expomod", 2]]], "+", 15, "log", 2, "-", 4, "*", 300], [0.9, "^", [["@This 0", "/", [2, "^", ["@This 0", "expomod", 2]]], "log", 2], "*", 100], ["@This 0", "expomod", 2, "*", -100, "/", 12, "+", 90], 1], ["@HSLA", [["@This 0", "/", [2, "^", ["@This 0", "expomod", 2]]], "+", 15, "log", 2, "-", 4, "*", 300], [0.9, "^", [["@This 0", "/", [2, "^", ["@This 0", "expomod", 2]]], "log", 2], "*", 100], ["@This 0", "expomod", 2, "*", -100, "/", 12, "+", 90], 0.5]], ["@conic-gradient", "#ff0000", "#ffff00", "#00ff00", "#00ffff", "#0000ff", "#ff00ff", "#ff0000"]], "#2f332f"],
                [[["@This 0", "expomod", 2, ">=", 5], "&&", ["@This 1", "=", 1]], ["+", "str_concat", ["@This 0", "defaultAbbrev"]], ["@multi-gradient", ["@radial-gradient", ["@HSLA", [["@This 0", "/", [2, "^", ["@This 0", "expomod", 2]]], "+", 15, "log", 2, "-", 4, "*", 300], [0.9, "^", [["@This 0", "/", [2, "^", ["@This 0", "expomod", 2]]], "log", 2], "*", 100], [0.85, "^", ["@This 0", "expomod", 2, "-", 5], "*", 50], 1], ["@HSLA", [["@This 0", "/", [2, "^", ["@This 0", "expomod", 2]]], "+", 15, "log", 2, "-", 4, "*", 300], [0.9, "^", [["@This 0", "/", [2, "^", ["@This 0", "expomod", 2]]], "log", 2], "*", 100], [0.85, "^", ["@This 0", "expomod", 2, "-", 5], "*", 50], 0.5]], ["@conic-gradient", "#ff0000", "#ffff00", "#00ff00", "#00ffff", "#0000ff", "#ff00ff", "#ff0000"]], "#deeedd"]
            ];
            MergeRules = [
                [2, [["@This 0", "=", "@Next 1 0"], "&&", ["@This 1", "=", 0], "&&", ["@Next 1 1", "=", 0]], true, [[["@This 0", "+", "@Next 1 0"], 0]], ["@This 0", "+", "@Next 1 0"], [false, true]],
                [2, [["@This 1", "=", 0], "&&", ["@Next 1 1", "=", 1]], false, [[["@This 0", "+", "@Next 1 0"], 0]], ["@This 0", "+", "@Next 1 0"], [false, true]],
                [2, [["@This 1", "=", 1], "&&", ["@Next 1 1", "=", 1]], true, [[["@This 0", "+", "@Next 1 0"], 1]], ["@This 0", "+", "@Next 1 0"], [false, true]]
            ];
            startTileSpawns = [[[1, 0], 70], [[1, 1], 30]];
            winConditions = [["@This 0", "=", 1321]];
            winRequirement = 1;
        }
        else {
            TileTypes = [
                [[1, 0], 1, "#ffffff", "#2f332f"],
                [[["@This 0", "expomod", 2, "<", 5], "&&", ["@This 1", "=", 0], "&&", ["@This 0", ">", 0]], "@This 0", ["@HSLA", [["@This 0", "/", [2, "^", ["@This 0", "expomod", 2]]], "+", 15, "log", 2, "-", 4, "*", 300], [0.9, "^", [["@This 0", "/", [2, "^", ["@This 0", "expomod", 2]]], "log", 2], "*", 100], ["@This 0", "expomod", 2, "*", -100, "/", 12, "+", 90], 1], "#2f332f"],
                [[["@This 0", "expomod", 2, ">=", 5], "&&", ["@This 1", "=", 0], "&&", ["@This 0", ">", 0]], "@This 0", ["@HSLA", [["@This 0", "/", [2, "^", ["@This 0", "expomod", 2]]], "+", 15, "log", 2, "-", 4, "*", 300], [0.9, "^", [["@This 0", "/", [2, "^", ["@This 0", "expomod", 2]]], "log", 2], "*", 100], [0.85, "^", ["@This 0", "expomod", 2, "-", 5], "*", 50], 1], "#deeedd"],
                [[1, 1], "+1", ["@multi-gradient", ["@radial-gradient", "#ffffff", "#fff8"], ["@conic-gradient", "#ff0000", "#ffff00", "#00ff00", "#00ffff", "#0000ff", "#ff00ff", "#ff0000"]], "#2f332f"],
                [[["@This 0", "expomod", 2, "<", 5], "&&", ["@This 1", "=", 1], "&&", ["@This 0", ">", 0]], ["+", "str_concat", ["@This 0", "defaultAbbrev"]], ["@multi-gradient", ["@radial-gradient", ["@HSLA", [["@This 0", "/", [2, "^", ["@This 0", "expomod", 2]]], "+", 15, "log", 2, "-", 4, "*", 300], [0.9, "^", [["@This 0", "/", [2, "^", ["@This 0", "expomod", 2]]], "log", 2], "*", 100], ["@This 0", "expomod", 2, "*", -100, "/", 12, "+", 90], 1], ["@HSLA", [["@This 0", "/", [2, "^", ["@This 0", "expomod", 2]]], "+", 15, "log", 2, "-", 4, "*", 300], [0.9, "^", [["@This 0", "/", [2, "^", ["@This 0", "expomod", 2]]], "log", 2], "*", 100], ["@This 0", "expomod", 2, "*", -100, "/", 12, "+", 90], 0.5]], ["@conic-gradient", "#ff0000", "#ffff00", "#00ff00", "#00ffff", "#0000ff", "#ff00ff", "#ff0000"]], "#2f332f"],
                [[["@This 0", "expomod", 2, ">=", 5], "&&", ["@This 1", "=", 1], "&&", ["@This 0", ">", 0]], ["+", "str_concat", ["@This 0", "defaultAbbrev"]], ["@multi-gradient", ["@radial-gradient", ["@HSLA", [["@This 0", "/", [2, "^", ["@This 0", "expomod", 2]]], "+", 15, "log", 2, "-", 4, "*", 300], [0.9, "^", [["@This 0", "/", [2, "^", ["@This 0", "expomod", 2]]], "log", 2], "*", 100], [0.85, "^", ["@This 0", "expomod", 2, "-", 5], "*", 50], 1], ["@HSLA", [["@This 0", "/", [2, "^", ["@This 0", "expomod", 2]]], "+", 15, "log", 2, "-", 4, "*", 300], [0.9, "^", [["@This 0", "/", [2, "^", ["@This 0", "expomod", 2]]], "log", 2], "*", 100], [0.85, "^", ["@This 0", "expomod", 2, "-", 5], "*", 50], 0.5]], ["@conic-gradient", "#ff0000", "#ffff00", "#00ff00", "#00ffff", "#0000ff", "#ff00ff", "#ff0000"]], "#deeedd"],
                [[-1, 0], -1, "#000000", "#d0ccd0"],
                [[["@This 0", "expomod", 2, "<", 5], "&&", ["@This 1", "=", 0], "&&", ["@This 0", "<", 0]], "@This 0", ["@rotate", 180, true, ["@HSLA", [["@This 0", "/", [2, "^", ["@This 0", "expomod", 2]]], "+", 15, "log", 2, "-", 4, "*", 300], [0.9, "^", [["@This 0", "/", [2, "^", ["@This 0", "expomod", 2]]], "log", 2], "*", 100], ["@This 0", "expomod", 2, "*", -100, "/", 12, "+", 90], 1]], "#d0ccd0"],
                [[["@This 0", "expomod", 2, ">=", 5], "&&", ["@This 1", "=", 0], "&&", ["@This 0", "<", 0]], "@This 0", ["@rotate", 180, true, ["@HSLA", [["@This 0", "/", [2, "^", ["@This 0", "expomod", 2]]], "+", 15, "log", 2, "-", 4, "*", 300], [0.9, "^", [["@This 0", "/", [2, "^", ["@This 0", "expomod", 2]]], "log", 2], "*", 100], [0.85, "^", ["@This 0", "expomod", 2, "-", 5], "*", 50], 1]], "#211122"],
                [[-1, 1], "+-1", ["@rotate", 180, true, ["@multi-gradient", ["@radial-gradient", "#ffffff", "#fff8"], ["@conic-gradient", "#ff0000", "#ffff00", "#00ff00", "#00ffff", "#0000ff", "#ff00ff", "#ff0000"]]], "#d0ccd0"],
                [[["@This 0", "expomod", 2, "<", 5], "&&", ["@This 1", "=", 1], "&&", ["@This 0", "<", 0]], ["+", "str_concat", ["@This 0", "defaultAbbrev"]], ["@rotate", 180, true, ["@multi-gradient", ["@radial-gradient", ["@HSLA", [["@This 0", "/", [2, "^", ["@This 0", "expomod", 2]]], "+", 15, "log", 2, "-", 4, "*", 300], [0.9, "^", [["@This 0", "/", [2, "^", ["@This 0", "expomod", 2]]], "log", 2], "*", 100], ["@This 0", "expomod", 2, "*", -100, "/", 12, "+", 90], 1], ["@HSLA", [["@This 0", "/", [2, "^", ["@This 0", "expomod", 2]]], "+", 15, "log", 2, "-", 4, "*", 300], [0.9, "^", [["@This 0", "/", [2, "^", ["@This 0", "expomod", 2]]], "log", 2], "*", 100], ["@This 0", "expomod", 2, "*", -100, "/", 12, "+", 90], 0.5]], ["@conic-gradient", "#ff0000", "#ffff00", "#00ff00", "#00ffff", "#0000ff", "#ff00ff", "#ff0000"]]], "#d0ccd0"],
                [[["@This 0", "expomod", 2, ">=", 5], "&&", ["@This 1", "=", 1], "&&", ["@This 0", "<", 0]], ["+", "str_concat", ["@This 0", "defaultAbbrev"]], ["@rotate", 180, true, ["@multi-gradient", ["@radial-gradient", ["@HSLA", [["@This 0", "/", [2, "^", ["@This 0", "expomod", 2]]], "+", 15, "log", 2, "-", 4, "*", 300], [0.9, "^", [["@This 0", "/", [2, "^", ["@This 0", "expomod", 2]]], "log", 2], "*", 100], [0.85, "^", ["@This 0", "expomod", 2, "-", 5], "*", 50], 1], ["@HSLA", [["@This 0", "/", [2, "^", ["@This 0", "expomod", 2]]], "+", 15, "log", 2, "-", 4, "*", 300], [0.9, "^", [["@This 0", "/", [2, "^", ["@This 0", "expomod", 2]]], "log", 2], "*", 100], [0.85, "^", ["@This 0", "expomod", 2, "-", 5], "*", 50], 0.5]], ["@conic-gradient", "#ff0000", "#ffff00", "#00ff00", "#00ffff", "#0000ff", "#ff00ff", "#ff0000"]]], "#211122"]
            ];
            MergeRules = [
                [2, [["@This 0", "=", "@Next 1 0"], "&&", ["@This 1", "=", 0], "&&", ["@Next 1 1", "=", 0]], true, [[["@This 0", "+", "@Next 1 0"], 0]], ["@This 0", "+", "@Next 1 0"], [false, true]],
                [2, [["@This 1", "=", 0], "&&", ["@Next 1 1", "=", 1], "&&", [["@This 0", "sign"], "=", ["@Next 1 0", "sign"]]], false, [[["@This 0", "+", "@Next 1 0"], 0]], ["@This 0", "+", "@Next 1 0", "abs"], [false, true]],
                [2, [["@This 1", "=", 1], "&&", ["@Next 1 1", "=", 1], "&&", [["@This 0", "sign"], "=", ["@Next 1 0", "sign"]]], true, [[["@This 0", "+", "@Next 1 0"], 1]], ["@This 0", "+", "@Next 1 0", "abs"], [false, true]]
            ];
            if (modifiers[13] == "Interacting") {
                MergeRules = [
                    [2, ["@This 0", "+", "@Next 1 0", "=", 0], true, [], 0],
                    [2, [["@This 0", "=", "@Next 1 0"], "&&", ["@This 1", "=", 0], "&&", ["@Next 1 1", "=", 0]], true, [[["@This 0", "+", "@Next 1 0"], 0]], ["@This 0", "+", "@Next 1 0", "abs"], [false, true]],
                    [2, [["@This 1", "=", 0], "&&", ["@Next 1 1", "=", 1]], false, [[["@This 0", "+", "@Next 1 0"], 0]], ["@This 0", "+", "@Next 1 0", "abs"], [false, true]],
                    [2, [["@This 1", "=", 1], "&&", ["@Next 1 1", "=", 1]], true, [[["@This 0", "+", "@Next 1 0"], 1]], ["@This 0", "+", "@Next 1 0", "abs"], [false, true]]
                ];
            }
            startTileSpawns = [[[1, 0], 70], [[1, 1], 30], [[-1, 0], 70], [[-1, 1], 30]];
            winConditions = [["@This 0", "abs", "=", 1321]];
            winRequirement = 2; 
        }
        document.documentElement.style.setProperty("background-image", "radial-gradient(#deeedd 0% 50%, #deeeddaa 100%), conic-gradient(#f00, #ff0, #0f0, #0ff, #00f, #f0f, #f00)");
        document.documentElement.style.setProperty("--background-color", "#deeedd");
        document.documentElement.style.setProperty("--grid-color", "#94ac93");
        document.documentElement.style.setProperty("--tile-color", "#c1d4c1");
        document.documentElement.style.setProperty("--text-color", "#2f332f");
        displayRules("rules_text", ["h1", "1321"], ["p", "Merges occur between two equal tiles, but there are also +1 tiles that can merge with anything. Get to the 1321 tile to win (your first task is figuring out how to get there...). If you're looking for a different kind of challenge, see how many different multiples of 32 you can make!"],
        ["p", "Spawning tiles: 1 (70%), +1 (30%)"]);
        displayRules("gm_rules_text", ["h1", "1321"], ["p", "Merges occur between two equal tiles, but there are also +1 tiles that can merge with anything. Get to the 1321 tile to win (your first task is figuring out how to get there...). If you're looking for a different kind of challenge, see how many different multiples of 32 you can make!"],
        ["p", "Spawning tiles: 1 (70%), +1 (30%)"]);
        statBoxes = [["Discovered Tiles", ["@DiscTiles", "arr_length"]], ["Score", "@Score"], ["Discovered Multiples of 32", ["@DiscTiles", "arr_reduce", 0, ["@if", ["@var_retain", "@Var -1", "arr_elem", "0", "expomod", 2, ">=", 5], "+", 1, "@end-if"]]]];
    }
    else if (mode == 44) { // mod 27
        width = 5; height = 5; min_dim = 3;
        start_game_vars = [3]; // The modulus
        if (modifiers[13] == "None") {
            TileNumAmount = 1;
            TileTypes = [
                [[0], 0, "#444444", "#ffffff"],
                [[1], 1, ["@multi-gradient", ["@radial-gradient", "#000000", "#0008"], ["@conic-gradient", "#ff0000", "#ffff00", "#00ff00", "#00ffff", "#0000ff", "#ff00ff", "#ff0000"]], "#ffffff"],
                [true, ["@This 0"], ["@linear-gradient", ["@HSVA", ["@This 0", "-", 2, "*", 55.623], ["@This 0", "-", 2, "/", 13, "mod", 4, "-", 2, "abs", "*", 35, "+", 30], ["@This 0", "-", 2, "/", 50, "mod", 4, "-", 2, "abs", "*", 25, "+", 50], 1], ["@HSVA", ["@This 0", "-", 2, "*", 0.995, "*", 55.623], ["@This 0", "-", 2, "*", 0.995, "/", 13, "mod", 4, "-", 2, "abs", "*", 35, "+", 30], ["@This 0", "-", 2, "*", 0.995, "/", 50, "mod", 4, "-", 2, "abs", "*", 25, "+", 50], 1]], "#ffffff"]
            ];
            MergeRules = [
                [2, [["@NextNE -1 0", "!=", "@This 0"], "&&", ["@This 0", "=", "@Next 1 0"], "&&", ["@This 0", "!=", 1]], true, [[["@This 0", "*", "@MLength", "%", "@GVar 0"]]], [0, "@if", [["@This 0", "*", "@MLength", "%", "@GVar 0"], "=", 1], "2nd", 1, "@end-if"], [], 2, [0, 1], 1, Math.max(width, height)],
                [0, ["@This 0", "=", 1], true, [], 0]
            ];
            startTileSpawns = [[[2], 1]];
        }
        else {
            TileNumAmount = 1;
            TileTypes = [
                [[0], 0, "#444444", "#ffffff"],
                [[1], 1, ["@multi-gradient", ["@radial-gradient", "#000000", "#0008"], ["@conic-gradient", "#ff0000", "#ffff00", "#00ff00", "#00ffff", "#0000ff", "#ff00ff", "#ff0000"]], "#ffffff"],
                [["@This 0", ">", 0], ["@This 0"], ["@linear-gradient", ["@HSVA", ["@This 0", "-", 2, "*", 55.623], ["@This 0", "-", 2, "/", 13, "mod", 4, "-", 2, "abs", "*", 35, "+", 30], ["@This 0", "-", 2, "/", 50, "mod", 4, "-", 2, "abs", "*", 25, "+", 50], 1], ["@HSVA", ["@This 0", "-", 2, "*", 0.995, "*", 55.623], ["@This 0", "-", 2, "*", 0.995, "/", 13, "mod", 4, "-", 2, "abs", "*", 35, "+", 30], ["@This 0", "-", 2, "*", 0.995, "/", 50, "mod", 4, "-", 2, "abs", "*", 25, "+", 50], 1]], "#ffffff"],
                [[-1], -1, ["@rotate", 180, true, ["@multi-gradient", ["@radial-gradient", "#000000", "#0008"], ["@conic-gradient", "#ff0000", "#ffff00", "#00ff00", "#00ffff", "#0000ff", "#ff00ff", "#ff0000"]]], "#000000"],
                [["@This 1", "<", 0], ["@This 0"], ["@rotate", 180, true, ["@linear-gradient", ["@HSVA", ["@This 0", "*", -1, "-", 2, "*", 55.623], ["@This 0", "*", -1, "-", 2, "/", 13, "mod", 4, "-", 2, "abs", "*", 35, "+", 30], ["@This 0", "*", -1, "-", 2, "/", 50, "mod", 4, "-", 2, "abs", "*", 25, "+", 50], 1], ["@HSVA", ["@This 0", "*", -1, "-", 2, "*", 0.995, "*", 55.623], ["@This 0", "*", -1, "-", 2, "*", 0.995, "/", 13, "mod", 4, "-", 2, "abs", "*", 35, "+", 30], ["@This 0", "*", -1, "-", 2, "*", 0.995, "/", 50, "mod", 4, "-", 2, "abs", "*", 25, "+", 50], 1]]], "#000000"]
            ];
            MergeRules = [
                [2, [["@NextNE -1 0", "!=", "@This 0"], "&&", ["@This 0", "=", "@Next 1 0"], "&&", ["@This 0", "abs", "!=", 1]], true, [[["@This 0", "*", "@MLength", "%", "@GVar 0"]]], [0, "@if", [["@This 0", "*", "@MLength", "%", "@GVar 0", "abs"], "=", 1], "2nd", 1, "@end-if"], [], 2, [0, 1], 1, Math.max(width, height)],
                [0, ["@This 0", "abs", "=", 1], true, [], 0]
            ];
            startTileSpawns = [[[2], 1], [[-2], 1]];
            if (modifiers[13] == "Interacting") MergeRules.push([2, [["@This 0", "*", -1, "=", "@Next 1 0"]], true, [[0]], 0, [false, true]]);
        }
        winConditions = [];
        winRequirement = ["@GVar 0", "=", 27];
        scripts = [[[0, "@if", ["@Grid", "arr_flat", 1, "arr_reduce", false, ["@if", ["@var_retain", "@Var -1", "arr_elem", 0, "abs", "=", 1], "2nd", true, "@end-if"]], "@edit_gvar", 0, ["@GVar 0", "+", 2], "@end-if"], "EndMovement"]]
        document.documentElement.style.setProperty("background-image", "linear-gradient(90deg, #bfff98, #df96d9, #bfff98)");
        document.documentElement.style.setProperty("--background-color", "linear-gradient(#df96d9, #bfff98, #df96d9)");
        document.documentElement.style.setProperty("--grid-color", "#ff81f5");
        document.documentElement.style.setProperty("--tile-color", "#c3ed8f");
        document.documentElement.style.setProperty("--text-color", "#3c293b");
        displayRules("rules_text", ["h2", "Modular Supermerging"], ["h1", "mod 27"], ["p", "Merges occur between any amount of equal tiles, but they obey modular arithmetic. The modulus starts at 3, but any 1 tiles disappear at the end of a turn and the modulus goes up by 2 after a turn where any 1 tiles are made. Get to a modulus of 27 to win!"],
        ["p", "Spawning tiles: 2 (100%)"]);
        displayRules("gm_rules_text", ["h2", "Modular Supermerging"], ["h1", "mod 27"], ["p", "Merges occur between any amount of equal tiles, but they obey modular arithmetic. The modulus starts at 3, but any 1 tiles disappear at the end of a turn and the modulus goes up by 2 after a turn where any 1 tiles are made. Get to a modulus of 27 to win!"],
        ["p", "Spawning tiles: 2 (100%)"]);
        statBoxes = [["Discovered Tiles", ["@DiscTiles", "arr_length"]], ["Modulus", "@GVar 0"], ["1s Created", "@Score"]];
    }
    else if (mode == 45) { // Directional Merges
        width = 6; height = 6; min_dim = 2;
        TileNumAmount = 6;
        mode_vars = [2]; // The difficulty; different difficulties have different merge rules, meaning they're essentially different gamemodes
        TileTypes = [
            [[0, 0, 0, 0, 0, 0], 1, "#666666", "#cccccc"],
            [[["@This 2", "=", 0], "&&", ["@This 3", "=", 0], "&&", ["@This 4", "=", 0], "&&", ["@This 5", "=", 0]], [[2, "^", "@This 0"], "*", [3, "^", "@This 1"], "*", [5, "^", "@This 2"], "*", [7, "^", "@This 3"], "*", [11, "^", "@This 4"], "*", [13, "^", "@This 5"]], ["@HSLA", ["@This 1", "/", ["@This 0", "+", "@This 1"], "*", -240], 100, [0.75, "^", ["@This 0", "gcd", "@This 1"], "*", -50, "+", 100], 1], "#000000"],
            [[["@This 0", "=", 0], "&&", ["@This 1", "=", 0], "&&", ["@This 4", "=", 0], "&&", ["@This 5", "=", 0]], [[2, "^", "@This 0"], "*", [3, "^", "@This 1"], "*", [5, "^", "@This 2"], "*", [7, "^", "@This 3"], "*", [11, "^", "@This 4"], "*", [13, "^", "@This 5"]], ["@HSLA", ["@This 3", "/", ["@This 2", "+", "@This 3"], "*", 240, "+", 180], 100, [0.75, "^", ["@This 2", "gcd", "@This 3"], "*", 50], 1], "#ffffff"],
            [[["@This 0", "=", 0], "&&", ["@This 1", "=", 0], "&&", ["@This 2", "=", 0], "&&", ["@This 3", "=", 0]], [[2, "^", "@This 0"], "*", [3, "^", "@This 1"], "*", [5, "^", "@This 2"], "*", [7, "^", "@This 3"], "*", [11, "^", "@This 4"], "*", [13, "^", "@This 5"]], ["@HSLA", ["@This 5", "/", ["@This 4", "+", "@This 5"], "*", -240, "+", 150], 75, [0.75, "^", ["@This 4", "gcd", "@This 5"], "*", -50, "+", 100], 1], "#000000"],
            [[["@This 4", "=", 0], "&&", ["@This 5", "=", 0]], [[2, "^", "@This 0"], "*", [3, "^", "@This 1"], "*", [5, "^", "@This 2"], "*", [7, "^", "@This 3"], "*", [11, "^", "@This 4"], "*", [13, "^", "@This 5"]], ["@linear-gradient", ["@HSLA", ["@This 1", "/", ["@This 0", "+", "@This 1"], "*", -240], 100, [0.75, "^", ["@This 0", "gcd", "@This 1"], "*", -50, "+", 100], 1], ["@HSLA", ["@This 3", "/", ["@This 2", "+", "@This 3"], "*", 240, "+", 180], 100, [0.75, "^", ["@This 2", "gcd", "@This 3"], "*", 50], 1]], "#ffffff"],
            [[["@This 2", "=", 0], "&&", ["@This 3", "=", 0]], [[2, "^", "@This 0"], "*", [3, "^", "@This 1"], "*", [5, "^", "@This 2"], "*", [7, "^", "@This 3"], "*", [11, "^", "@This 4"], "*", [13, "^", "@This 5"]], ["@linear-gradient", ["@HSLA", ["@This 1", "/", ["@This 0", "+", "@This 1"], "*", -240], 100, [0.75, "^", ["@This 0", "gcd", "@This 1"], "*", -50, "+", 100], 1], ["@HSLA", ["@This 5", "/", ["@This 4", "+", "@This 5"], "*", -240, "+", 150], 75, [0.75, "^", ["@This 4", "gcd", "@This 5"], "*", -50, "+", 100], 1]], "#000000"],
            [[["@This 0", "=", 0], "&&", ["@This 1", "=", 0]], [[2, "^", "@This 0"], "*", [3, "^", "@This 1"], "*", [5, "^", "@This 2"], "*", [7, "^", "@This 3"], "*", [11, "^", "@This 4"], "*", [13, "^", "@This 5"]], ["@linear-gradient", ["@HSLA", ["@This 3", "/", ["@This 2", "+", "@This 3"], "*", 240, "+", 180], 100, [0.75, "^", ["@This 2", "gcd", "@This 3"], "*", 50], 1], ["@HSLA", ["@This 5", "/", ["@This 4", "+", "@This 5"], "*", -240, "+", 150], 75, [0.75, "^", ["@This 4", "gcd", "@This 5"], "*", -50, "+", 100], 1]], "#ffffff"],
            [true, [[2, "^", "@This 0"], "*", [3, "^", "@This 1"], "*", [5, "^", "@This 2"], "*", [7, "^", "@This 3"], "*", [11, "^", "@This 4"], "*", [13, "^", "@This 5"]], ["@linear-gradient", ["@HSLA", ["@This 1", "/", ["@This 0", "+", "@This 1"], "*", -240], 100, [0.75, "^", ["@This 0", "gcd", "@This 1"], "*", -50, "+", 100], 1], ["@HSLA", ["@This 3", "/", ["@This 2", "+", "@This 3"], "*", 240, "+", 180], 100, [0.75, "^", ["@This 2", "gcd", "@This 3"], "*", 50], 1], ["@HSLA", ["@This 5", "/", ["@This 4", "+", "@This 5"], "*", -240, "+", 150], 75, [0.75, "^", ["@This 4", "gcd", "@This 5"], "*", -50, "+", 100], 1]], "#ffffff"],
        ];
        startTileSpawns = [[[0, 0, 0, 0, 0, 0], 1]];
        winRequirement = 1;
        // A lot of the setup for this mode is handled by gmDisplayVars
        statBoxes = [["Discovered Tiles", ["@DiscTiles", "arr_length"]], ["Score", "@Score"]];
        document.getElementById("mode_vars_line").style.setProperty("display", "block");
        document.getElementById("2100_vars").style.setProperty("display", "flex");
    }
    if (modifiers[5] == "Diamond" || modifiers[5] == "Hexagon") modifiers[6] = min_dim;
    else if (modifiers[5] == "4D") {
        modifiers[6] = min_dim;
        modifiers[7] = min_dim;
        modifiers[8] = min_dim;
        if (min_dim == 2) modifiers[9] = 2;
        else modifiers[9] = 1;
    }
    else if (modifiers[5] == "Custom") { //Part 2 of forcing the custom grid past the modes' width and height changes
        width = modifiers[6];
        height = modifiers[7];
    }
    gmDisplayVars();
}

function gmDisplayVars() {
    if (modifiers[5] == "Diamond") {
        document.getElementById("gm_diamond_counter").innerHTML = modifiers[6];
        if (modifiers[6] * 2 - 1 >= min_dim) document.getElementById("gm_diamond_minus").style.setProperty("display", "inline-block");
        else document.getElementById("gm_diamond_minus").style.setProperty("display", "none");
        if (modifiers[6] * 2 + 3 <= 9999) document.getElementById("gm_diamond_plus").style.setProperty("display", "inline-block");
        else document.getElementById("gm_diamond_plus").style.setProperty("display", "none");
    }
    if (modifiers[5] == "Hexagon") {
        document.getElementById("gm_diamond_counter").innerHTML = modifiers[6];
        if (modifiers[6] * 4 - 1 >= min_dim) document.getElementById("gm_diamond_minus").style.setProperty("display", "inline-block");
        else document.getElementById("gm_diamond_minus").style.setProperty("display", "none");
        if (modifiers[6] * 4 + 5 <= 9999) document.getElementById("gm_diamond_plus").style.setProperty("display", "inline-block");
        else document.getElementById("gm_diamond_plus").style.setProperty("display", "none");
    }
    if (modifiers[5] == "4D") {
        document.getElementById("gm_4D_width_counter").innerHTML = modifiers[6];
        if (modifiers[6] > 1) document.getElementById("gm_4D_width_minus").style.setProperty("display", "inline-block");
        else document.getElementById("gm_4D_width_minus").style.setProperty("display", "none");
        if (modifiers[6] < 99) document.getElementById("gm_4D_width_plus").style.setProperty("display", "inline-block");
        else document.getElementById("gm_4D_width_plus").style.setProperty("display", "none");
        document.getElementById("gm_4D_height_counter").innerHTML = modifiers[7];
        if (modifiers[7] > 1) document.getElementById("gm_4D_height_minus").style.setProperty("display", "inline-block");
        else document.getElementById("gm_4D_height_minus").style.setProperty("display", "none");
        if (modifiers[7] < 99) document.getElementById("gm_4D_height_plus").style.setProperty("display", "inline-block");
        else document.getElementById("gm_4D_height_plus").style.setProperty("display", "none");
        document.getElementById("gm_4D_length_counter").innerHTML = modifiers[8];
        if (modifiers[8] > 1) document.getElementById("gm_4D_length_minus").style.setProperty("display", "inline-block");
        else document.getElementById("gm_4D_length_minus").style.setProperty("display", "none");
        if (modifiers[8] < 99) document.getElementById("gm_4D_length_plus").style.setProperty("display", "inline-block");
        else document.getElementById("gm_4D_length_plus").style.setProperty("display", "none");
        document.getElementById("gm_4D_depth_counter").innerHTML = modifiers[9];
        if (modifiers[9] > 1) document.getElementById("gm_4D_depth_minus").style.setProperty("display", "inline-block");
        else document.getElementById("gm_4D_depth_minus").style.setProperty("display", "none");
        if (modifiers[9] < 99) document.getElementById("gm_4D_depth_plus").style.setProperty("display", "inline-block");
        else document.getElementById("gm_4D_depth_plus").style.setProperty("display", "none");
    }
    else if (modifiers[5] != "Custom") {
        document.getElementById("gm_width_counter").innerHTML = width;
        document.getElementById("gm_height_counter").innerHTML = height;
        if (width > 1) document.getElementById("gm_width_minus").style.setProperty("display", "inline-block");
        else document.getElementById("gm_width_minus").style.setProperty("display", "none");
        if (height > 1) document.getElementById("gm_height_minus").style.setProperty("display", "inline-block");
        else document.getElementById("gm_height_minus").style.setProperty("display", "none");
        if (width < 9999) document.getElementById("gm_width_plus").style.setProperty("display", "inline-block");
        else document.getElementById("gm_width_plus").style.setProperty("display", "none");
        if (height < 9999) document.getElementById("gm_height_plus").style.setProperty("display", "inline-block");
        else document.getElementById("gm_height_plus").style.setProperty("display", "none");
    }
    if (gamemode == 1) { // 2048
        if (mode_vars[0]) {
            document.getElementById("2048_spawn_text").innerHTML = "To match the original 2048, 2s are the primary spawning tile.";
            document.getElementById("2048_spawn_text").style.setProperty("color", "#f9eee3");
            displayRules("rules_text", ["h2", "Powers of 2"], ["h1", "2048"], ["p", "Merges occur between two tiles of the same number. Get to the 2048 tile to win!"],
            [ "p", "Spawning tiles: 2 (90%), 4 (10%)"]);
            displayRules("gm_rules_text", ["h2", "Powers of 2"], ["h1", "2048"], ["p", "Merges occur between two tiles of the same number. Get to the 2048 tile to win!"],
            ["p", "Spawning tiles: 2 (90%), 4 (10%)"]);
        }
        else {
            document.getElementById("2048_spawn_text").innerHTML = "To match the rest of the 2048 Power Compendium modes, 1s are the primary spawning tile.";
            document.getElementById("2048_spawn_text").style.setProperty("color", "#ffffff");
            displayRules("rules_text", ["h2", "Powers of 2"], ["h1", "2048"], ["p", "Merges occur between two tiles of the same number. Get to the 2048 tile to win!"],
            ["p", "Spawning tiles: 1 (85%), 2 (12%), 4 (3%)"]);
            displayRules("gm_rules_text", ["h2", "Powers of 2"], ["h1", "2048"], ["p", "Merges occur between two tiles of the same number. Get to the 2048 tile to win!"],
            ["p", "Spawning tiles: 1 (85%), 2 (12%), 4 (3%)"]);
        }
    }
    if (gamemode == 4) { // 3125
        if (mode_vars[0]) {
            document.getElementById("3125_3-1_text").innerHTML = "Any merge adding up to a number equal to, double, triple, or quadruple a power of five is allowed.";
            document.getElementById("3125_3-1_text").style.setProperty("color", "#f7ffe6");
            displayRules("rules_text", ["h2", "Powers of 5"], ["h1", "3125"], ["p","Merges occur between any two tiles that add to a power of five, double a power of five, triple a power of five, or quadruple a power of five. Get to the 3125 tile to win!"],
            ["p", "Spawning tiles: 1 (80%), 2 (8%), 3 (6%), 4 (4%), 5 (2%)"]);
            displayRules("gm_rules_text", ["h2", "Powers of 5"], ["h1", "3125"], ["p","Merges occur between any two tiles that add to a power of five, double a power of five, triple a power of five, or quadruple a power of five. Get to the 3125 tile to win!"],
            ["p", "Spawning tiles: 1 (80%), 2 (8%), 3 (6%), 4 (4%), 5 (2%)"]);
        }
        else {
            document.getElementById("3125_3-1_text").innerHTML = "Merges do not occur between a tile that's a power of five and a tile that's three times that power of five.";
            document.getElementById("3125_3-1_text").style.setProperty("color", "#669600");
            displayRules("rules_text", ["h2", "Powers of 5"], ["h1", "3125"], ["p","Merges occur between two equal tiles that are either a power of five or double a power of five, between a tile that's a power of five and a tile that's double that power of five, between a tile that's double a power of five and a tile that's triple that power of five, or between a tile that's a power of five and a tile that's quadruple that power of 5. Get to the 3125 tile to win!"],
            ["p", "Spawning tiles: 1 (80%), 2 (10%), 3 (4%), 4 (4%), 5 (2%)"]);
            displayRules("gm_rules_text", ["h2", "Powers of 5"], ["h1", "3125"], ["p","Merges occur between two equal tiles that are either a power of five or double a power of five, between a tile that's a power of five and a tile that's double that power of five, between a tile that's double a power of five and a tile that's triple that power of five, or between a tile that's a power of five and a tile that's quadruple that power of 5. Get to the 3125 tile to win!"],
            ["p", "Spawning tiles: 1 (80%), 2 (10%), 3 (4%), 4 (4%), 5 (2%)"]);
        }
    }
    else if (gamemode == 25) { // XXXX
        if (mode_vars[0] > Math.max(width, height)) mode_vars[0] = Math.max(width, height);
        if (mode_vars[1] > Math.max(width, height) && mode_vars[1] != Infinity) mode_vars[1] = Math.max(width, height);
        document.getElementById("XXXX_min_counter").innerHTML = mode_vars[0];
        if (mode_vars[1] == Infinity) document.getElementById("XXXX_max_counter").innerHTML = "&infin;";
        else document.getElementById("XXXX_max_counter").innerHTML = mode_vars[1];
        if (mode_vars[0] < 3) document.getElementById("XXXX_min_minus").style.setProperty("display", "none");
        else document.getElementById("XXXX_min_minus").style.setProperty("display", "inline-block");
        if (mode_vars[0] >= Math.max(width, height)) document.getElementById("XXXX_min_plus").style.setProperty("display", "none");
        else document.getElementById("XXXX_min_plus").style.setProperty("display", "inline-block");
        if (mode_vars[1] == Infinity) document.getElementById("XXXX_max_minus").style.setProperty("display", "none");
        else document.getElementById("XXXX_max_minus").style.setProperty("display", "inline-block");
        if (mode_vars[1] >= Math.max(width, height) && mode_vars[1] != Infinity) document.getElementById("XXXX_max_plus").style.setProperty("display", "none");
        else document.getElementById("XXXX_max_plus").style.setProperty("display", "inline-block");
    }
    else if (gamemode == 31) { // Isotopic 256
        document.getElementById("Isotopic256_halfLife_change").value = mode_vars[0];
    }
    else if (gamemode == 37) { // 2216.8378200531005859375
        if (mode_vars[0] == 0) {
            document.getElementById("ThreeHalves_mode_text").innerHTML = "Two of the same power of 1.5 merge partially, with half of the colliding tile being absorbed into the resulting tile.";
            document.getElementById("ThreeHalves_mode_text").style.setProperty("color", "#406abf");
            displayRules("rules_text", ["h2", "Powers of 1.5"], ["h1", "2216.8378200531005859375"], ["p","Merges occur between two tiles that are the same number. Tiles that are a power of 1.5 will only merge partially, with only half of the colliding tile absorbed into the result, so two 1s merge into a 1.5 and a 0.5, while two 1.5s merge into a 2.25 and a 0.75. If the tiles are not powers of 1.5, they merge entirely, so two 0.5s merge into a 1. Get to the 2216.838 (1.5<sup>19</sup>) tile to win!"],
            ["p", "Spawning tiles: 1 (80%), 0.5 (10%), 1.5 (10%)"]);
            displayRules("gm_rules_text", ["h2", "Powers of 1.5"], ["h1", "2216.8378200531005859375"], ["p","Merges occur between two tiles that are the same number. Tiles that are a power of 1.5 will only merge partially, with only half of the colliding tile absorbed into the result, so two 1s merge into a 1.5 and a 0.5, while two 1.5s merge into a 2.25 and a 0.75. If the tiles are not powers of 1.5, they merge entirely, so two 0.5s merge into a 1. Get to the 2216.838 (1.5<sup>19</sup>) tile to win!"],
            ["p", "Spawning tiles: 1 (80%), 0.5 (10%), 1.5 (10%)"]);
        }
        else if (mode_vars[0] == 1) {
            document.getElementById("ThreeHalves_mode_text").innerHTML = "There are &#247;2 tiles that can merge with any power of 1.5, and merges occur between a tile that's a power of 1.5 and a tile that's half of it, or between two equal tiles that are not a power of 1.5.";
            document.getElementById("ThreeHalves_mode_text").style.setProperty("color", "#a83fce");
            displayRules("rules_text", ["h2", "Powers of 1.5"], ["h1", "2216.8378200531005859375"], ["p", "Merges occur between a tile that's a power of 1.5 and a tile that's half of that power of 1.5, or between two equal tiles that are not a power of 1.5. There are also &#247;2 tiles, which can merge with any power of 1.5 (or with themselves to reduce clutter). Get to the 2216.838 (1.5<sup>19</sup>) tile to win!"],
            ["p", "Spawning tiles: 1 (50%), &#247;2 (50%)"])
            displayRules("gm_rules_text", ["h2", "Powers of 1.5"], ["h1", "2216.8378200531005859375"], ["p", "Merges occur between a tile that's a power of 1.5 and a tile that's half of that power of 1.5, or between two equal tiles that are not a power of 1.5. There are also &#247;2 tiles, which can merge with any power of 1.5 (or with themselves to reduce clutter). Get to the 2216.838 (1.5<sup>19</sup>) tile to win!"],
            ["p", "Spawning tiles: 1 (50%), &#247;2 (50%)"]);
        }
    }
    else if (gamemode == 39) { // 2592
        if (mode_vars[0] == 0) {
            document.getElementById("2592_switch_text").innerHTML = "The merge rules switch after each move.";
            document.getElementById("2592_switch_text").style.setProperty("color", "#7cffb5");
            displayRules("rules_text", ["h2", "3-Smooth Numbers"], ["h1", "2592"], ["p", "The merge rules switch after each move. On even-numbered moves, merges occur between two equal tiles. On odd-numbered moves, merges occur between three equal tiles. Get to the 2592 tile to win!"],
            ["p", "Spawning tiles: 1 (90%), 2 (5%), 3 (5%)"]);
            displayRules("gm_rules_text", ["h2", "3-Smooth Numbers"], ["h1", "2592"], ["p", "The merge rules switch after each move. On even-numbered moves, merges occur between two equal tiles. On odd-numbered moves, merges occur between three equal tiles. Get to the 2592 tile to win!"],
            ["p", "Spawning tiles: 1 (90%), 2 (5%), 3 (5%)"]);
        }
        else if (mode_vars[0] == 1) {
            document.getElementById("2592_switch_text").innerHTML = "The merge rules switch after each move where a merge occurs.";
            document.getElementById("2592_switch_text").style.setProperty("color", "#ffd500");
            displayRules("rules_text", ["h2", "3-Smooth Numbers"], ["h1", "2592"], ["p", "The merge rules switch after each move where a merge occurs. At first, merges occur between two equal tiles. After the first move where a merge occurs, merges occur between three equal tiles. The merge rules alternate between these two states. Get to the 2592 tile to win!"],
            ["p", "Spawning tiles: 1 (90%), 2 (5%), 3 (5%)"]);
            displayRules("gm_rules_text", ["h2", "3-Smooth Numbers"], ["h1", "2592"], ["p", "The merge rules switch after each move where a merge occurs. At first, merges occur between two equal tiles. After the first move where a merge occurs, merges occur between three equal tiles. The merge rules alternate between these two states. Get to the 2592 tile to win!"],
            ["p", "Spawning tiles: 1 (90%), 2 (5%), 3 (5%)"]);
        }
        else if (mode_vars[0] == 2) {
            document.getElementById("2592_switch_text").innerHTML = "The merge rules switch based on the amount of merges that have happened so far, not counting the current turn.";
            document.getElementById("2592_switch_text").style.setProperty("color", "#9d00ff");
            displayRules("rules_text", ["h2", "3-Smooth Numbers"], ["h1", "2592"], ["p", "The merge rules switch based on the amount of merges that have happened in the game thus far. If the amount of merges is even, merges occur between two equal tiles. If the amount of merges is odd, merges occur between three equal tiles. The merge count only updates after each move, so the merge rules won't change in the middle of a move. Get to the 2592 tile to win!"],
            ["p", "Spawning tiles: 1 (90%), 2 (5%), 3 (5%)"]);
            displayRules("gm_rules_text", ["h2", "3-Smooth Numbers"], ["h1", "2592"], ["p", "The merge rules switch based on the amount of merges that have happened in the game thus far. If the amount of merges is even, merges occur between two equal tiles. If the amount of merges is odd, merges occur between three equal tiles. The merge count only updates after each move, so the merge rules won't change in the middle of a move. Get to the 2592 tile to win!"],
            ["p", "Spawning tiles: 1 (90%), 2 (5%), 3 (5%)"]);
        }
    }
    else if (gamemode == 40) { // Wildcard 2048
        if (mode_vars[0]) {
            document.getElementById("Wildcard2048_add_text").innerHTML = "When two tiles merge, all of their possibilities combine.";
            document.getElementById("Wildcard2048_add_text").style.setProperty("color", "#b83f1a");
            displayRules("rules_text", ["h1", "Wildcard 2048 (Melting Pot Mode)"], ["p", "2048, but some tiles can act as multiple tiles, such as a \"2 4\" tile, which could merge with a 2 or with a 4. Two of these \"wildcard\" tiles can merge as long as they share at least one possibility. When two tiles merge, they combine in a \"melting pot\" fashion: for example, a 4 tile and a 2 4 tile merge into an 8 2 tile, while a 1 2 tile and a 1 4 tile merge into an 8 tile. To win, you must make a regular 2048 tile - a tile with 2048 as one of its multiple possibilities doesn't count!"],
            ["p", "Spawning tiles: 1 (35%), 2 (15%), 4 (10%), 1 2 (12%), 1 4 (8%), 2 4 (8%), 1 2 4 (8%). The remaining 4% chance spawns a tile that could be any combination of tiles up to (but not including) the highest power of 2 you've reached, but is biased towards smaller values."]);
            displayRules("gm_rules_text", ["h1", "Wildcard 2048 (Melting Pot Mode)"], ["p", "2048, but some tiles can act as multiple tiles, such as a \"2 4\" tile, which could merge with a 2 or with a 4. Two of these \"wildcard\" tiles can merge as long as they share at least one possibility. When two tiles merge, they combine in a \"melting pot\" fashion: for example, a 4 tile and a 2 4 tile merge into an 8 2 tile, while a 1 2 tile and a 1 4 tile merge into an 8 tile. To win, you must make a regular 2048 tile - a tile with 2048 as one of its multiple possibilities doesn't count!"],
            ["p", "Spawning tiles: 1 (35%), 2 (15%), 4 (10%), 1 2 (12%), 1 4 (8%), 2 4 (8%), 1 2 4 (8%). The remaining 4% chance spawns a tile that could be any combination of tiles up to (but not including) the highest power of 2 you've reached, but is biased towards smaller values."]);
        }
        else {
            document.getElementById("Wildcard2048_add_text").innerHTML = "When two tiles merge, only the possibilities they both share remain.";
            document.getElementById("Wildcard2048_add_text").style.setProperty("color", "#524439");
            displayRules("rules_text", ["h1", "Wildcard 2048"], ["p", "2048, but some tiles can act as multiple tiles, such as a \"2 4\" tile, which could merge with a 2 to make a 4, or it could merge with a 4 to make an 8. Two of these \"wildcard\" tiles can merge as long as they share at least one possibility, and the result of their merge is a tile that contains all of the possibilities they both had, but doubled since they just merged. For example, a 1 2 4 tile and a 2 4 8 tile share the 2 and 4 possibilities, so they merge into a 4 8 tile. To win, you must make a regular 2048 tile - a tile with 2048 as one of its multiple possibilities doesn't count!"],
            ["p", "Spawning tiles: 1 (35%), 2 (15%), 4 (10%), 1 2 (12%), 1 4 (8%), 2 4 (8%), 1 2 4 (8%). The remaining 4% chance spawns a tile that could be any combination of tiles up to (but not including) the highest power of 2 you've reached, but is biased towards smaller values."]);
            displayRules("gm_rules_text", ["h1", "Wildcard 2048"], ["p", "2048, but some tiles can act as multiple tiles, such as a \"2 4\" tile, which could merge with a 2 to make a 4, or it could merge with a 4 to make an 8. Two of these \"wildcard\" tiles can merge as long as they share at least one possibility, and the result of their merge is a tile that contains all of the possibilities they both had, but doubled since they just merged. For example, a 1 2 4 tile and a 2 4 8 tile share the 2 and 4 possibilities, so they merge into a 4 8 tile. To win, you must make a regular 2048 tile - a tile with 2048 as one of its multiple possibilities doesn't count!"],
            ["p", "Spawning tiles: 1 (35%), 2 (15%), 4 (10%), 1 2 (12%), 1 4 (8%), 2 4 (8%), 1 2 4 (8%). The remaining 4% chance spawns a tile that could be any combination of tiles up to (but not including) the highest power of 2 you've reached, but is biased towards smaller values."]);
        }
    }
    else if (gamemode == 41) { // X^Y
        if (mode_vars[0] == Infinity) document.getElementById("XpowY_pow_counter").innerHTML = "&infin;";
        else document.getElementById("XpowY_pow_counter").innerHTML = mode_vars[0];
        document.getElementById("XpowY_merge_counter").innerHTML = mode_vars[1];
        if (mode_vars[1] < 5) document.getElementById("XpowY_merge_minus").style.setProperty("display", "none");
        else document.getElementById("XpowY_merge_minus").style.setProperty("display", "inline-block");
        document.getElementById("XpowY_merge_plus").style.setProperty("display", "inline-block");
    }
    else if (gamemode == 45) { // Directional Merges
        // Not only does this mode have different difficulties, it also behaves differently when the movement directions are altered by the grid modifiers
        if (((modifiers[5] == "Square" || modifiers[5] == "Diamond") && modifiers[10] == "Orthogonal") || (modifiers[5] == "Checkerboard") && modifiers[10] == "Diagonal") { // Orthogonal only
            if (mode_vars[0] == 1) { // Easy
                document.getElementById("2100_difficulty_text").innerHTML = "Easy: rightwards and downwards are X + X, leftwards and upwards are X + 2X.";
                document.getElementById("2100_difficulty_text").style.setProperty("color", "#a0d4ff");
                document.getElementById("2100_difficulty_decrease").style.setProperty("display", "none");
                document.getElementById("2100_difficulty_increase").style.setProperty("display", "block");
                displayRules("rules_text", ["h2", "Directional Merges (Easy)"], ["h1", "1944"], ["p","The merge rules are different depending on which direction you're moving. On a rightwards or downwards move, merges occur between two equal tiles. On a leftwards or upwards move, merges occur between an X tile and a 2X tile, for any X. Get to the 1944 tile to win!"],
                ["p", "Spawning tiles: 1 (100%)"]);
                displayRules("gm_rules_text", ["h2", "Directional Merges (Easy)"], ["h1", "1944"], ["p","The merge rules are different depending on which direction you're moving. On a rightwards or downwards move, merges occur between two equal tiles. On a leftwards or upwards move, merges occur between an X tile and a 2X tile, for any X. Get to the 1944 tile to win!"],
                ["p", "Spawning tiles: 1 (100%)"]);
                MergeRules = [
                    [2, [["@HDir", ">", 0], "||", ["@VDir", ">", 0], "&&", ["@This 0", "=", "@Next 1 0"], "&&", ["@This 1", "=", "@Next 1 1"], "&&", ["@This 2", "=", "@Next 1 2"], "&&", ["@This 3", "=", "@Next 1 3"], "&&", ["@This 4", "=", "@Next 1 4"], "&&", ["@This 5", "=", "@Next 1 5"]], false, [[["@This 0", "+", 1], "@This 1", "@This 2", "@This 3", "@This 4", "@This 5"]], [[2, "^", "@This 0"], "*", [3, "^", "@This 1"], "*", [5, "^", "@This 2"], "*", [7, "^", "@This 3"], "*", [11, "^", "@This 4"], "*", [13, "^", "@This 5"], "*", 2], [false, true]],
                    [2, [["@HDir", "<", 0], "||", ["@VDir", "<", 0], "&&", ["@This 0", "+", 1, "=", "@Next 1 0"], "&&", ["@This 1", "=", "@Next 1 1"], "&&", ["@This 2", "=", "@Next 1 2"], "&&", ["@This 3", "=", "@Next 1 3"], "&&", ["@This 4", "=", "@Next 1 4"], "&&", ["@This 5", "=", "@Next 1 5"]], false, [["@This 0", ["@This 1", "+", 1], "@This 2", "@This 3", "@This 4", "@This 5"]], [[2, "^", "@This 0"], "*", [3, "^", "@This 1"], "*", [5, "^", "@This 2"], "*", [7, "^", "@This 3"], "*", [11, "^", "@This 4"], "*", [13, "^", "@This 5"], "*", 3], [false, true]]
                ];
                winConditions = [[3, 5, 0, 0, 0, 0]];
                document.documentElement.style.setProperty("background-image", "linear-gradient(#90cdff, #00447c)");
                document.documentElement.style.setProperty("--background-color", "linear-gradient(#73c0ff, #005eac)");
                document.documentElement.style.setProperty("--grid-color", "#125c99");
                document.documentElement.style.setProperty("--tile-color", "#3f89c6");
                document.documentElement.style.setProperty("--text-color", "#003159");
            }
            else if (mode_vars[0] == 2) { // Medium
                document.getElementById("2100_difficulty_text").innerHTML = "Medium: rightwards is X + X, downwards is X + 2X, leftwards is X + 3X, upwards is 2X + 3X.";
                document.getElementById("2100_difficulty_text").style.setProperty("color", "#7573ff");
                document.getElementById("2100_difficulty_decrease").style.setProperty("display", "block");
                document.getElementById("2100_difficulty_increase").style.setProperty("display", "block");
                displayRules("rules_text", ["h2", "Directional Merges (Medium)"], ["h1", "2160"], ["p","The merge rules are different depending on which direction you're moving. On a rightwards move, merges occur between two equal tiles. On a downwards move, merges occur between an X tile and a 2X tile, for any X. On a leftwards move, merges occur between an X tile and a 3X tile, for any X. On an upwards move, merges occur between a 2X tile and a 3X tile, for any X. Get to the 2160 tile to win!"],
                ["p", "Spawning tiles: 1 (100%)"]);
                displayRules("gm_rules_text", ["h2", "Directional Merges (Medium)"], ["h1", "2160"], ["p","The merge rules are different depending on which direction you're moving. On a rightwards move, merges occur between two equal tiles. On a downwards move, merges occur between an X tile and a 2X tile, for any X. On a leftwards move, merges occur between an X tile and a 3X tile, for any X. On an upwards move, merges occur between a 2X tile and a 3X tile, for any X. Get to the 2160 tile to win!"],
                ["p", "Spawning tiles: 1 (100%)"]);
                MergeRules = [
                    [2, [["@HDir", ">", 0], "&&", ["@This 0", "=", "@Next 1 0"], "&&", ["@This 1", "=", "@Next 1 1"], "&&", ["@This 2", "=", "@Next 1 2"], "&&", ["@This 3", "=", "@Next 1 3"], "&&", ["@This 4", "=", "@Next 1 4"], "&&", ["@This 5", "=", "@Next 1 5"]], false, [[["@This 0", "+", 1], "@This 1", "@This 2", "@This 3", "@This 4", "@This 5"]], [[2, "^", "@This 0"], "*", [3, "^", "@This 1"], "*", [5, "^", "@This 2"], "*", [7, "^", "@This 3"], "*", [11, "^", "@This 4"], "*", [13, "^", "@This 5"], "*", 2], [false, true]],
                    [2, [["@VDir", ">", 0], "&&", ["@This 0", "+", 1, "=", "@Next 1 0"], "&&", ["@This 1", "=", "@Next 1 1"], "&&", ["@This 2", "=", "@Next 1 2"], "&&", ["@This 3", "=", "@Next 1 3"], "&&", ["@This 4", "=", "@Next 1 4"], "&&", ["@This 5", "=", "@Next 1 5"]], false, [["@This 0", ["@This 1", "+", 1], "@This 2", "@This 3", "@This 4", "@This 5"]], [[2, "^", "@This 0"], "*", [3, "^", "@This 1"], "*", [5, "^", "@This 2"], "*", [7, "^", "@This 3"], "*", [11, "^", "@This 4"], "*", [13, "^", "@This 5"], "*", 3], [false, true]],
                    [2, [["@HDir", "<", 0], "&&", ["@This 0", "=", "@Next 1 0"], "&&", ["@This 1", "+", 1, "=", "@Next 1 1"], "&&", ["@This 2", "=", "@Next 1 2"], "&&", ["@This 3", "=", "@Next 1 3"], "&&", ["@This 4", "=", "@Next 1 4"], "&&", ["@This 5", "=", "@Next 1 5"]], false, [[["@This 0", "+", 2], "@This 1", "@This 2", "@This 3", "@This 4", "@This 5"]], [[2, "^", "@This 0"], "*", [3, "^", "@This 1"], "*", [5, "^", "@This 2"], "*", [7, "^", "@This 3"], "*", [11, "^", "@This 4"], "*", [13, "^", "@This 5"], "*", 4], [false, true]],
                    [2, [["@VDir", "<", 0], "&&", ["@This 0", "-", 1, "=", "@Next 1 0"], "&&", ["@This 1", "+", 1, "=", "@Next 1 1"], "&&", ["@This 2", "=", "@Next 1 2"], "&&", ["@This 3", "=", "@Next 1 3"], "&&", ["@This 4", "=", "@Next 1 4"], "&&", ["@This 5", "=", "@Next 1 5"]], false, [[["@This 0", "-", 1], "@This 1", ["@This 2", "+", 1], "@This 3", "@This 4", "@This 5"]], [[2, "^", "@This 0"], "*", [3, "^", "@This 1"], "*", [5, "^", "@This 2"], "*", [7, "^", "@This 3"], "*", [11, "^", "@This 4"], "*", [13, "^", "@This 5"], "*", 5, "/", 2], [false, true]]
                ];
                winConditions = [[4, 3, 1, 0, 0, 0]];
                document.documentElement.style.setProperty("background-image", "linear-gradient(#c2acff, #004f4f)");
                document.documentElement.style.setProperty("--background-color", "linear-gradient(#926aff, #008383)");
                document.documentElement.style.setProperty("--grid-color", "#218383");
                document.documentElement.style.setProperty("--tile-color", "#977ce1");
                document.documentElement.style.setProperty("--text-color", "#23144e");
            }
            else if (mode_vars[0] == 3) { // Hard
                document.getElementById("2100_difficulty_text").innerHTML = "Hard: rightwards is X + X, downwards is X + 2X, leftwards is X + 4X, upwards is 3X + 4X.";
                document.getElementById("2100_difficulty_text").style.setProperty("color", "#bc79ff");
                document.getElementById("2100_difficulty_decrease").style.setProperty("opacity", "block");
                document.getElementById("2100_difficulty_increase").style.setProperty("display", "none");
                displayRules("rules_text", ["h2", "Directional Merges (Hard)"], ["h1", "2100"], ["p","The merge rules are different depending on which direction you're moving. On a rightwards move, merges occur between two equal tiles. On a downwards move, merges occur between an X tile and a 2X tile, for any X. On a leftwards move, merges occur between an X tile and a 4X tile, for any X. On an upwards move, merges occur between a 3X tile and a 4X tile, for any X. Get to the 2100 tile to win!"],
                ["p", "Spawning tiles: 1 (100%)"]);
                displayRules("gm_rules_text", ["h2", "Directional Merges (Hard)"], ["h1", "2100"], ["p","The merge rules are different depending on which direction you're moving. On a rightwards move, merges occur between two equal tiles. On a downwards move, merges occur between an X tile and a 2X tile, for any X. On a leftwards move, merges occur between an X tile and a 4X tile, for any X. On an upwards move, merges occur between a 3X tile and a 4X tile, for any X. Get to the 2100 tile to win!"],
                ["p", "Spawning tiles: 1 (100%)"]);
                MergeRules = [
                    [2, [["@HDir", ">", 0], "&&", ["@This 0", "=", "@Next 1 0"], "&&", ["@This 1", "=", "@Next 1 1"], "&&", ["@This 2", "=", "@Next 1 2"], "&&", ["@This 3", "=", "@Next 1 3"], "&&", ["@This 4", "=", "@Next 1 4"], "&&", ["@This 5", "=", "@Next 1 5"]], false, [[["@This 0", "+", 1], "@This 1", "@This 2", "@This 3", "@This 4", "@This 5"]], [[2, "^", "@This 0"], "*", [3, "^", "@This 1"], "*", [5, "^", "@This 2"], "*", [7, "^", "@This 3"], "*", [11, "^", "@This 4"], "*", [13, "^", "@This 5"], "*", 2], [false, true]],
                    [2, [["@VDir", ">", 0], "&&", ["@This 0", "+", 1, "=", "@Next 1 0"], "&&", ["@This 1", "=", "@Next 1 1"], "&&", ["@This 2", "=", "@Next 1 2"], "&&", ["@This 3", "=", "@Next 1 3"], "&&", ["@This 4", "=", "@Next 1 4"], "&&", ["@This 5", "=", "@Next 1 5"]], false, [["@This 0", ["@This 1", "+", 1], "@This 2", "@This 3", "@This 4", "@This 5"]], [[2, "^", "@This 0"], "*", [3, "^", "@This 1"], "*", [5, "^", "@This 2"], "*", [7, "^", "@This 3"], "*", [11, "^", "@This 4"], "*", [13, "^", "@This 5"], "*", 3], [false, true]],
                    [2, [["@HDir", "<", 0], "&&", ["@This 0", "+", 2, "=", "@Next 1 0"], "&&", ["@This 1", "=", "@Next 1 1"], "&&", ["@This 2", "=", "@Next 1 2"], "&&", ["@This 3", "=", "@Next 1 3"], "&&", ["@This 4", "=", "@Next 1 4"], "&&", ["@This 5", "=", "@Next 1 5"]], false, [["@This 0", "@This 1", ["@This 2", "+", 1], "@This 3", "@This 4", "@This 5"]], [[2, "^", "@This 0"], "*", [3, "^", "@This 1"], "*", [5, "^", "@This 2"], "*", [7, "^", "@This 3"], "*", [11, "^", "@This 4"], "*", [13, "^", "@This 5"], "*", 5], [false, true]],
                    [2, [["@VDir", "<", 0], "&&", ["@This 0", "+", 2, "=", "@Next 1 0"], "&&", ["@This 1", "-", 1, "=", "@Next 1 1"], "&&", ["@This 2", "=", "@Next 1 2"], "&&", ["@This 3", "=", "@Next 1 3"], "&&", ["@This 4", "=", "@Next 1 4"], "&&", ["@This 5", "=", "@Next 1 5"]], false, [["@This 0", ["@This 1", "-", 1], "@This 2", ["@This 3", "+", 1], "@This 4", "@This 5"]], [[2, "^", "@This 0"], "*", [3, "^", "@This 1"], "*", [5, "^", "@This 2"], "*", [7, "^", "@This 3"], "*", [11, "^", "@This 4"], "*", [13, "^", "@This 5"], "*", 7, "/", 3], [false, true]]
                ];
                winConditions = [[2, 1, 2, 1, 0, 0]];
                document.documentElement.style.setProperty("background-image", "linear-gradient(#e6b5ff, #19004d)");
                document.documentElement.style.setProperty("--background-color", "linear-gradient(#db93ff, #200061)");
                document.documentElement.style.setProperty("--grid-color", "#330099");
                document.documentElement.style.setProperty("--tile-color", "#cb63ff");
                document.documentElement.style.setProperty("--text-color", "#2c0d4b");
            }
        }
        else if (((modifiers[5] == "Square" || modifiers[5] == "Diamond") && modifiers[10] == "Diagonal") || (modifiers[5] == "Checkerboard") && modifiers[10] == "Orthogonal") { // Diagonal only. The modes here are the same as orthogonal only, but with diagonal directions replacing orthogonal directions.
            if (mode_vars[0] == 1) { // Easy
                document.getElementById("2100_difficulty_text").innerHTML = "Easy: northeast and southeast are X + X, southwest and northwest are X + 2X.";
                document.getElementById("2100_difficulty_text").style.setProperty("color", "#a0d4ff");
                document.getElementById("2100_difficulty_decrease").style.setProperty("display", "none");
                document.getElementById("2100_difficulty_increase").style.setProperty("display", "block");
                displayRules("rules_text", ["h2", "Directional Merges (Easy)"], ["h1", "1944"], ["p","The merge rules are different depending on which direction you're moving. On a northeast or southeast move, merges occur between two equal tiles. On a southwest or northwest move, merges occur between an X tile and a 2X tile, for any X. Get to the 1944 tile to win!"],
                ["p", "Spawning tiles: 1 (100%)"]);
                displayRules("gm_rules_text", ["h2", "Directional Merges (Easy)"], ["h1", "1944"], ["p","The merge rules are different depending on which direction you're moving. On a northeast or southeast move, merges occur between two equal tiles. On a southwest or northwest move, merges occur between an X tile and a 2X tile, for any X. Get to the 1944 tile to win!"],
                ["p", "Spawning tiles: 1 (100%)"]);
                MergeRules = [
                    [2, [["@HDir", ">", 0], "&&", ["@This 0", "=", "@Next 1 0"], "&&", ["@This 1", "=", "@Next 1 1"], "&&", ["@This 2", "=", "@Next 1 2"], "&&", ["@This 3", "=", "@Next 1 3"], "&&", ["@This 4", "=", "@Next 1 4"], "&&", ["@This 5", "=", "@Next 1 5"]], false, [[["@This 0", "+", 1], "@This 1", "@This 2", "@This 3", "@This 4", "@This 5"]], [[2, "^", "@This 0"], "*", [3, "^", "@This 1"], "*", [5, "^", "@This 2"], "*", [7, "^", "@This 3"], "*", [11, "^", "@This 4"], "*", [13, "^", "@This 5"], "*", 2], [false, true]],
                    [2, [["@HDir", "<", 0], "&&", ["@This 0", "+", 1, "=", "@Next 1 0"], "&&", ["@This 1", "=", "@Next 1 1"], "&&", ["@This 2", "=", "@Next 1 2"], "&&", ["@This 3", "=", "@Next 1 3"], "&&", ["@This 4", "=", "@Next 1 4"], "&&", ["@This 5", "=", "@Next 1 5"]], false, [["@This 0", ["@This 1", "+", 1], "@This 2", "@This 3", "@This 4", "@This 5"]], [[2, "^", "@This 0"], "*", [3, "^", "@This 1"], "*", [5, "^", "@This 2"], "*", [7, "^", "@This 3"], "*", [11, "^", "@This 4"], "*", [13, "^", "@This 5"], "*", 3], [false, true]]
                ];
                winConditions = [[3, 5, 0, 0, 0, 0]];
                document.documentElement.style.setProperty("background-image", "linear-gradient(#90cdff, #00447c)");
                document.documentElement.style.setProperty("--background-color", "linear-gradient(#73c0ff, #005eac)");
                document.documentElement.style.setProperty("--grid-color", "#125c99");
                document.documentElement.style.setProperty("--tile-color", "#3f89c6");
                document.documentElement.style.setProperty("--text-color", "#003159");
            }
            else if (mode_vars[0] == 2) { // Medium
                document.getElementById("2100_difficulty_text").innerHTML = "Medium: northeast is X + X, southeast is X + 2X, southwest is X + 3X, northwest is 2X + 3X.";
                document.getElementById("2100_difficulty_text").style.setProperty("color", "#7573ff");
                document.getElementById("2100_difficulty_decrease").style.setProperty("display", "block");
                document.getElementById("2100_difficulty_increase").style.setProperty("display", "block");
                displayRules("rules_text", ["h2", "Directional Merges (Medium)"], ["h1", "2160"], ["p","The merge rules are different depending on which direction you're moving. On a northeast move, merges occur between two equal tiles. On a southeast move, merges occur between an X tile and a 2X tile, for any X. On a southwest move, merges occur between an X tile and a 3X tile, for any X. On a northwest move, merges occur between a 2X tile and a 3X tile, for any X. Get to the 2160 tile to win!"],
                ["p", "Spawning tiles: 1 (100%)"]);
                displayRules("gm_rules_text", ["h2", "Directional Merges (Medium)"], ["h1", "2160"], ["p","The merge rules are different depending on which direction you're moving. On a northeast move, merges occur between two equal tiles. On a southeast move, merges occur between an X tile and a 2X tile, for any X. On a southwest move, merges occur between an X tile and a 3X tile, for any X. On a northwest move, merges occur between a 2X tile and a 3X tile, for any X. Get to the 2160 tile to win!"],
                ["p", "Spawning tiles: 1 (100%)"]);
                MergeRules = [
                    [2, [[["@HDir", ">", 0], "&&", ["@VDir", "<", 0]], "&&", ["@This 0", "=", "@Next 1 0"], "&&", ["@This 1", "=", "@Next 1 1"], "&&", ["@This 2", "=", "@Next 1 2"], "&&", ["@This 3", "=", "@Next 1 3"], "&&", ["@This 4", "=", "@Next 1 4"], "&&", ["@This 5", "=", "@Next 1 5"]], false, [[["@This 0", "+", 1], "@This 1", "@This 2", "@This 3", "@This 4", "@This 5"]], [[2, "^", "@This 0"], "*", [3, "^", "@This 1"], "*", [5, "^", "@This 2"], "*", [7, "^", "@This 3"], "*", [11, "^", "@This 4"], "*", [13, "^", "@This 5"], "*", 2], [false, true]],
                    [2, [[["@HDir", ">", 0], "&&", ["@VDir", ">", 0]], "&&", ["@This 0", "+", 1, "=", "@Next 1 0"], "&&", ["@This 1", "=", "@Next 1 1"], "&&", ["@This 2", "=", "@Next 1 2"], "&&", ["@This 3", "=", "@Next 1 3"], "&&", ["@This 4", "=", "@Next 1 4"], "&&", ["@This 5", "=", "@Next 1 5"]], false, [["@This 0", ["@This 1", "+", 1], "@This 2", "@This 3", "@This 4", "@This 5"]], [[2, "^", "@This 0"], "*", [3, "^", "@This 1"], "*", [5, "^", "@This 2"], "*", [7, "^", "@This 3"], "*", [11, "^", "@This 4"], "*", [13, "^", "@This 5"], "*", 3], [false, true]],
                    [2, [[["@HDir", "<", 0], "&&", ["@VDir", ">", 0]], "&&", ["@This 0", "=", "@Next 1 0"], "&&", ["@This 1", "+", 1, "=", "@Next 1 1"], "&&", ["@This 2", "=", "@Next 1 2"], "&&", ["@This 3", "=", "@Next 1 3"], "&&", ["@This 4", "=", "@Next 1 4"], "&&", ["@This 5", "=", "@Next 1 5"]], false, [[["@This 0", "+", 2], "@This 1", "@This 2", "@This 3", "@This 4", "@This 5"]], [[2, "^", "@This 0"], "*", [3, "^", "@This 1"], "*", [5, "^", "@This 2"], "*", [7, "^", "@This 3"], "*", [11, "^", "@This 4"], "*", [13, "^", "@This 5"], "*", 4], [false, true]],
                    [2, [[["@HDir", "<", 0], "&&", ["@VDir", "<", 0]], "&&", ["@This 0", "-", 1, "=", "@Next 1 0"], "&&", ["@This 1", "+", 1, "=", "@Next 1 1"], "&&", ["@This 2", "=", "@Next 1 2"], "&&", ["@This 3", "=", "@Next 1 3"], "&&", ["@This 4", "=", "@Next 1 4"], "&&", ["@This 5", "=", "@Next 1 5"]], false, [[["@This 0", "-", 1], "@This 1", ["@This 2", "+", 1], "@This 3", "@This 4", "@This 5"]], [[2, "^", "@This 0"], "*", [3, "^", "@This 1"], "*", [5, "^", "@This 2"], "*", [7, "^", "@This 3"], "*", [11, "^", "@This 4"], "*", [13, "^", "@This 5"], "*", 5, "/", 2], [false, true]]
                ];
                winConditions = [[4, 3, 1, 0, 0, 0]];
                document.documentElement.style.setProperty("background-image", "linear-gradient(#c2acff, #004f4f)");
                document.documentElement.style.setProperty("--background-color", "linear-gradient(#926aff, #008383)");
                document.documentElement.style.setProperty("--grid-color", "#218383");
                document.documentElement.style.setProperty("--tile-color", "#977ce1");
                document.documentElement.style.setProperty("--text-color", "#23144e");
            }
            else if (mode_vars[0] == 3) { // Hard
                document.getElementById("2100_difficulty_text").innerHTML = "Hard: northeast is X + X, southeast is X + 2X, southwest is X + 4X, northwest is 3X + 4X.";
                document.getElementById("2100_difficulty_text").style.setProperty("color", "#bc79ff");
                document.getElementById("2100_difficulty_decrease").style.setProperty("opacity", "block");
                document.getElementById("2100_difficulty_increase").style.setProperty("display", "none");
                displayRules("rules_text", ["h2", "Directional Merges (Hard)"], ["h1", "2100"], ["p","The merge rules are different depending on which direction you're moving. On a northeast move, merges occur between two equal tiles. On a northwest move, merges occur between an X tile and a 2X tile, for any X. On a southwest move, merges occur between an X tile and a 4X tile, for any X. On a northwest move, merges occur between a 3X tile and a 4X tile, for any X. Get to the 2100 tile to win!"],
                ["p", "Spawning tiles: 1 (100%)"]);
                displayRules("gm_rules_text", ["h2", "Directional Merges (Hard)"], ["h1", "2100"], ["p","The merge rules are different depending on which direction you're moving. On a northeast move, merges occur between two equal tiles. On a northwest move, merges occur between an X tile and a 2X tile, for any X. On a southwest move, merges occur between an X tile and a 4X tile, for any X. On a northwest move, merges occur between a 3X tile and a 4X tile, for any X. Get to the 2100 tile to win!"],
                ["p", "Spawning tiles: 1 (100%)"]);
                MergeRules = [
                    [2, [[["@HDir", ">", 0], "&&", ["@VDir", "<", 0]], "&&", ["@This 0", "=", "@Next 1 0"], "&&", ["@This 1", "=", "@Next 1 1"], "&&", ["@This 2", "=", "@Next 1 2"], "&&", ["@This 3", "=", "@Next 1 3"], "&&", ["@This 4", "=", "@Next 1 4"], "&&", ["@This 5", "=", "@Next 1 5"]], false, [[["@This 0", "+", 1], "@This 1", "@This 2", "@This 3", "@This 4", "@This 5"]], [[2, "^", "@This 0"], "*", [3, "^", "@This 1"], "*", [5, "^", "@This 2"], "*", [7, "^", "@This 3"], "*", [11, "^", "@This 4"], "*", [13, "^", "@This 5"], "*", 2], [false, true]],
                    [2, [[["@HDir", ">", 0], "&&", ["@VDir", ">", 0]], "&&", ["@This 0", "+", 1, "=", "@Next 1 0"], "&&", ["@This 1", "=", "@Next 1 1"], "&&", ["@This 2", "=", "@Next 1 2"], "&&", ["@This 3", "=", "@Next 1 3"], "&&", ["@This 4", "=", "@Next 1 4"], "&&", ["@This 5", "=", "@Next 1 5"]], false, [["@This 0", ["@This 1", "+", 1], "@This 2", "@This 3", "@This 4", "@This 5"]], [[2, "^", "@This 0"], "*", [3, "^", "@This 1"], "*", [5, "^", "@This 2"], "*", [7, "^", "@This 3"], "*", [11, "^", "@This 4"], "*", [13, "^", "@This 5"], "*", 3], [false, true]],
                    [2, [[["@HDir", "<", 0], "&&", ["@VDir", ">", 0]], "&&", ["@This 0", "+", 2, "=", "@Next 1 0"], "&&", ["@This 1", "=", "@Next 1 1"], "&&", ["@This 2", "=", "@Next 1 2"], "&&", ["@This 3", "=", "@Next 1 3"], "&&", ["@This 4", "=", "@Next 1 4"], "&&", ["@This 5", "=", "@Next 1 5"]], false, [["@This 0", "@This 1", ["@This 2", "+", 1], "@This 3", "@This 4", "@This 5"]], [[2, "^", "@This 0"], "*", [3, "^", "@This 1"], "*", [5, "^", "@This 2"], "*", [7, "^", "@This 3"], "*", [11, "^", "@This 4"], "*", [13, "^", "@This 5"], "*", 5], [false, true]],
                    [2, [[["@HDir", "<", 0], "&&", ["@VDir", "<", 0]], "&&", ["@This 0", "+", 2, "=", "@Next 1 0"], "&&", ["@This 1", "-", 1, "=", "@Next 1 1"], "&&", ["@This 2", "=", "@Next 1 2"], "&&", ["@This 3", "=", "@Next 1 3"], "&&", ["@This 4", "=", "@Next 1 4"], "&&", ["@This 5", "=", "@Next 1 5"]], false, [["@This 0", ["@This 1", "-", 1], "@This 2", ["@This 3", "+", 1], "@This 4", "@This 5"]], [[2, "^", "@This 0"], "*", [3, "^", "@This 1"], "*", [5, "^", "@This 2"], "*", [7, "^", "@This 3"], "*", [11, "^", "@This 4"], "*", [13, "^", "@This 5"], "*", 7, "/", 3], [false, true]]
                ];
                winConditions = [[2, 1, 2, 1, 0, 0]];
                document.documentElement.style.setProperty("background-image", "linear-gradient(#e6b5ff, #19004d)");
                document.documentElement.style.setProperty("--background-color", "linear-gradient(#db93ff, #200061)");
                document.documentElement.style.setProperty("--grid-color", "#330099");
                document.documentElement.style.setProperty("--tile-color", "#cb63ff");
                document.documentElement.style.setProperty("--text-color", "#2c0d4b");
            }
        }
        else if (((modifiers[5] == "Square" || modifiers[5] == "Diamond" || modifiers[5] == "Checkerboard") && modifiers[10] == "Both") || modifiers[5] == "Custom") { // Eight-directional. Used for custom grid too, because you could use any set of directions you want there.
            if (mode_vars[0] == 0) { // Eight-Directional Easy
                document.getElementById("2100_difficulty_text").innerHTML = "Eight-Directional Easy: orthogonal directions are X + X, diagonal directions are X + 2X.";
                document.getElementById("2100_difficulty_text").style.setProperty("color", "#a0d4ff");
                document.getElementById("2100_difficulty_decrease").style.setProperty("display", "none");
                document.getElementById("2100_difficulty_increase").style.setProperty("display", "block");
                displayRules("rules_text", ["h2", "Directional Merges (Eight-Directional Easy)"], ["h1", "1944"], ["p","The merge rules are different depending on which direction you're moving. On a move in an orthogonal direction, merges occur between two equal tiles. On a move in a diagonal direction, merges occur between an X tile and a 2X tile, for any X. Get to the 1944 tile to win!"],
                ["p", "Spawning tiles: 1 (100%)"]);
                displayRules("gm_rules_text", ["h2", "Directional Merges (Eight-Directional Easy)"], ["h1", "1944"], ["p","The merge rules are different depending on which direction you're moving. On a move in an orthogonal direction, merges occur between two equal tiles. On a move in a diagonal direction, merges occur between an X tile and a 2X tile, for any X. Get to the 1944 tile to win!"],
                ["p", "Spawning tiles: 1 (100%)"]);
                MergeRules = [
                    [2, [["@HDir", "=", 0], "||", ["@VDir", "=", 0], "&&", ["@This 0", "=", "@Next 1 0"], "&&", ["@This 1", "=", "@Next 1 1"], "&&", ["@This 2", "=", "@Next 1 2"], "&&", ["@This 3", "=", "@Next 1 3"], "&&", ["@This 4", "=", "@Next 1 4"], "&&", ["@This 5", "=", "@Next 1 5"]], false, [[["@This 0", "+", 1], "@This 1", "@This 2", "@This 3", "@This 4", "@This 5"]], [[2, "^", "@This 0"], "*", [3, "^", "@This 1"], "*", [5, "^", "@This 2"], "*", [7, "^", "@This 3"], "*", [11, "^", "@This 4"], "*", [13, "^", "@This 5"], "*", 2], [false, true]],
                    [2, [["@HDir", "!=", 0], "&&", ["@VDir", "!=", 0], "&&", ["@This 0", "+", 1, "=", "@Next 1 0"], "&&", ["@This 1", "=", "@Next 1 1"], "&&", ["@This 2", "=", "@Next 1 2"], "&&", ["@This 3", "=", "@Next 1 3"], "&&", ["@This 4", "=", "@Next 1 4"], "&&", ["@This 5", "=", "@Next 1 5"]], false, [["@This 0", ["@This 1", "+", 1], "@This 2", "@This 3", "@This 4", "@This 5"]], [[2, "^", "@This 0"], "*", [3, "^", "@This 1"], "*", [5, "^", "@This 2"], "*", [7, "^", "@This 3"], "*", [11, "^", "@This 4"], "*", [13, "^", "@This 5"], "*", 3], [false, true]]
                ];
                winConditions = [[3, 5, 0, 0, 0, 0]];
                document.documentElement.style.setProperty("background-image", "linear-gradient(#90cdff, #00447c)");
                document.documentElement.style.setProperty("--background-color", "linear-gradient(#73c0ff, #005eac)");
                document.documentElement.style.setProperty("--grid-color", "#125c99");
                document.documentElement.style.setProperty("--tile-color", "#3f89c6");
                document.documentElement.style.setProperty("--text-color", "#003159");
            }
            else if (mode_vars[0] == 1) { // Easy
                document.getElementById("2100_difficulty_text").innerHTML = "Easy: rightwards and downwards are X + X, leftwards and upwards are X + 2X. Diagonals allow both merges from their constituent directions.";
                document.getElementById("2100_difficulty_text").style.setProperty("color", "#a0d4ff");
                document.getElementById("2100_difficulty_decrease").style.setProperty("display", "block");
                document.getElementById("2100_difficulty_increase").style.setProperty("display", "block");
                displayRules("rules_text", ["h2", "Directional Merges (Easy)"], ["h1", "1944"], ["p","The merge rules are different depending on which direction you're moving. On a rightwards or downwards move, merges occur between two equal tiles. On a leftwards or upwards move, merges occur between an X tile and a 2X tile, for any X. Get to the 1944 tile to win!"],
                ["p", "Spawning tiles: 1 (100%)"]);
                displayRules("gm_rules_text", ["h2", "Directional Merges (Easy)"], ["h1", "1944"], ["p","The merge rules are different depending on which direction you're moving. On a rightwards or downwards move, merges occur between two equal tiles. On a leftwards or upwards move, merges occur between an X tile and a 2X tile, for any X. Get to the 1944 tile to win!"],
                ["p", "Spawning tiles: 1 (100%)"]);
                MergeRules = [
                    [2, [["@HDir", ">", 0], "||", ["@VDir", ">", 0], "&&", ["@This 0", "=", "@Next 1 0"], "&&", ["@This 1", "=", "@Next 1 1"], "&&", ["@This 2", "=", "@Next 1 2"], "&&", ["@This 3", "=", "@Next 1 3"], "&&", ["@This 4", "=", "@Next 1 4"], "&&", ["@This 5", "=", "@Next 1 5"]], false, [[["@This 0", "+", 1], "@This 1", "@This 2", "@This 3", "@This 4", "@This 5"]], [[2, "^", "@This 0"], "*", [3, "^", "@This 1"], "*", [5, "^", "@This 2"], "*", [7, "^", "@This 3"], "*", [11, "^", "@This 4"], "*", [13, "^", "@This 5"], "*", 2], [false, true]],
                    [2, [["@HDir", "<", 0], "||", ["@VDir", "<", 0], "&&", ["@This 0", "+", 1, "=", "@Next 1 0"], "&&", ["@This 1", "=", "@Next 1 1"], "&&", ["@This 2", "=", "@Next 1 2"], "&&", ["@This 3", "=", "@Next 1 3"], "&&", ["@This 4", "=", "@Next 1 4"], "&&", ["@This 5", "=", "@Next 1 5"]], false, [["@This 0", ["@This 1", "+", 1], "@This 2", "@This 3", "@This 4", "@This 5"]], [[2, "^", "@This 0"], "*", [3, "^", "@This 1"], "*", [5, "^", "@This 2"], "*", [7, "^", "@This 3"], "*", [11, "^", "@This 4"], "*", [13, "^", "@This 5"], "*", 3], [false, true]]
                ];
                winConditions = [[3, 5, 0, 0, 0, 0]];
                document.documentElement.style.setProperty("background-image", "linear-gradient(#90cdff, #00447c)");
                document.documentElement.style.setProperty("--background-color", "linear-gradient(#73c0ff, #005eac)");
                document.documentElement.style.setProperty("--grid-color", "#125c99");
                document.documentElement.style.setProperty("--tile-color", "#3f89c6");
                document.documentElement.style.setProperty("--text-color", "#003159");
            }
            else if (mode_vars[0] == 2) { // Medium
                document.getElementById("2100_difficulty_text").innerHTML = "Medium: rightwards is X + X, downwards is X + 2X, leftwards is X + 3X, upwards is 2X + 3X. Diagonals allow both merges from their constituent directions.";
                document.getElementById("2100_difficulty_text").style.setProperty("color", "#7573ff");
                document.getElementById("2100_difficulty_decrease").style.setProperty("display", "block");
                document.getElementById("2100_difficulty_increase").style.setProperty("display", "block");
                displayRules("rules_text", ["h2", "Directional Merges (Medium)"], ["h1", "2160"], ["p","The merge rules are different depending on which direction you're moving. On a rightwards move, merges occur between two equal tiles. On a downwards move, merges occur between an X tile and a 2X tile, for any X. On a leftwards move, merges occur between an X tile and a 3X tile, for any X. On an upwards move, merges occur between a 2X tile and a 3X tile, for any X. Get to the 2160 tile to win!"],
                ["p", "Spawning tiles: 1 (100%)"]);
                displayRules("gm_rules_text", ["h2", "Directional Merges (Medium)"], ["h1", "2160"], ["p","The merge rules are different depending on which direction you're moving. On a rightwards move, merges occur between two equal tiles. On a downwards move, merges occur between an X tile and a 2X tile, for any X. On a leftwards move, merges occur between an X tile and a 3X tile, for any X. On an upwards move, merges occur between a 2X tile and a 3X tile, for any X. Get to the 2160 tile to win!"],
                ["p", "Spawning tiles: 1 (100%)"]);
                MergeRules = [
                    [2, [["@HDir", ">", 0], "&&", ["@This 0", "=", "@Next 1 0"], "&&", ["@This 1", "=", "@Next 1 1"], "&&", ["@This 2", "=", "@Next 1 2"], "&&", ["@This 3", "=", "@Next 1 3"], "&&", ["@This 4", "=", "@Next 1 4"], "&&", ["@This 5", "=", "@Next 1 5"]], false, [[["@This 0", "+", 1], "@This 1", "@This 2", "@This 3", "@This 4", "@This 5"]], [[2, "^", "@This 0"], "*", [3, "^", "@This 1"], "*", [5, "^", "@This 2"], "*", [7, "^", "@This 3"], "*", [11, "^", "@This 4"], "*", [13, "^", "@This 5"], "*", 2], [false, true]],
                    [2, [["@VDir", ">", 0], "&&", ["@This 0", "+", 1, "=", "@Next 1 0"], "&&", ["@This 1", "=", "@Next 1 1"], "&&", ["@This 2", "=", "@Next 1 2"], "&&", ["@This 3", "=", "@Next 1 3"], "&&", ["@This 4", "=", "@Next 1 4"], "&&", ["@This 5", "=", "@Next 1 5"]], false, [["@This 0", ["@This 1", "+", 1], "@This 2", "@This 3", "@This 4", "@This 5"]], [[2, "^", "@This 0"], "*", [3, "^", "@This 1"], "*", [5, "^", "@This 2"], "*", [7, "^", "@This 3"], "*", [11, "^", "@This 4"], "*", [13, "^", "@This 5"], "*", 3], [false, true]],
                    [2, [["@HDir", "<", 0], "&&", ["@This 0", "=", "@Next 1 0"], "&&", ["@This 1", "+", 1, "=", "@Next 1 1"], "&&", ["@This 2", "=", "@Next 1 2"], "&&", ["@This 3", "=", "@Next 1 3"], "&&", ["@This 4", "=", "@Next 1 4"], "&&", ["@This 5", "=", "@Next 1 5"]], false, [[["@This 0", "+", 2], "@This 1", "@This 2", "@This 3", "@This 4", "@This 5"]], [[2, "^", "@This 0"], "*", [3, "^", "@This 1"], "*", [5, "^", "@This 2"], "*", [7, "^", "@This 3"], "*", [11, "^", "@This 4"], "*", [13, "^", "@This 5"], "*", 4], [false, true]],
                    [2, [["@VDir", "<", 0], "&&", ["@This 0", "-", 1, "=", "@Next 1 0"], "&&", ["@This 1", "+", 1, "=", "@Next 1 1"], "&&", ["@This 2", "=", "@Next 1 2"], "&&", ["@This 3", "=", "@Next 1 3"], "&&", ["@This 4", "=", "@Next 1 4"], "&&", ["@This 5", "=", "@Next 1 5"]], false, [[["@This 0", "-", 1], "@This 1", ["@This 2", "+", 1], "@This 3", "@This 4", "@This 5"]], [[2, "^", "@This 0"], "*", [3, "^", "@This 1"], "*", [5, "^", "@This 2"], "*", [7, "^", "@This 3"], "*", [11, "^", "@This 4"], "*", [13, "^", "@This 5"], "*", 5, "/", 2], [false, true]]
                ];
                winConditions = [[4, 3, 1, 0, 0, 0]];
                document.documentElement.style.setProperty("background-image", "linear-gradient(#c2acff, #004f4f)");
                document.documentElement.style.setProperty("--background-color", "linear-gradient(#926aff, #008383)");
                document.documentElement.style.setProperty("--grid-color", "#218383");
                document.documentElement.style.setProperty("--tile-color", "#977ce1");
                document.documentElement.style.setProperty("--text-color", "#23144e");
            }
            else if (mode_vars[0] == 3) { // Hard
                document.getElementById("2100_difficulty_text").innerHTML = "Hard: rightwards is X + X, downwards is X + 2X, leftwards is X + 4X, upwards is 3X + 4X. Diagonals allow both merges from their constituent directions.";
                document.getElementById("2100_difficulty_text").style.setProperty("color", "#bc79ff");
                document.getElementById("2100_difficulty_decrease").style.setProperty("opacity", "block");
                document.getElementById("2100_difficulty_increase").style.setProperty("display", "block");
                displayRules("rules_text", ["h2", "Directional Merges (Hard)"], ["h1", "2100"], ["p","The merge rules are different depending on which direction you're moving. On a rightwards move, merges occur between two equal tiles. On a downwards move, merges occur between an X tile and a 2X tile, for any X. On a leftwards move, merges occur between an X tile and a 4X tile, for any X. On an upwards move, merges occur between a 3X tile and a 4X tile, for any X. Get to the 2100 tile to win!"],
                ["p", "Spawning tiles: 1 (100%)"]);
                displayRules("gm_rules_text", ["h2", "Directional Merges (Hard)"], ["h1", "2100"], ["p","The merge rules are different depending on which direction you're moving. On a rightwards move, merges occur between two equal tiles. On a downwards move, merges occur between an X tile and a 2X tile, for any X. On a leftwards move, merges occur between an X tile and a 4X tile, for any X. On an upwards move, merges occur between a 3X tile and a 4X tile, for any X. Get to the 2100 tile to win!"],
                ["p", "Spawning tiles: 1 (100%)"]);
                MergeRules = [
                    [2, [["@HDir", ">", 0], "&&", ["@This 0", "=", "@Next 1 0"], "&&", ["@This 1", "=", "@Next 1 1"], "&&", ["@This 2", "=", "@Next 1 2"], "&&", ["@This 3", "=", "@Next 1 3"], "&&", ["@This 4", "=", "@Next 1 4"], "&&", ["@This 5", "=", "@Next 1 5"]], false, [[["@This 0", "+", 1], "@This 1", "@This 2", "@This 3", "@This 4", "@This 5"]], [[2, "^", "@This 0"], "*", [3, "^", "@This 1"], "*", [5, "^", "@This 2"], "*", [7, "^", "@This 3"], "*", [11, "^", "@This 4"], "*", [13, "^", "@This 5"], "*", 2], [false, true]],
                    [2, [["@VDir", ">", 0], "&&", ["@This 0", "+", 1, "=", "@Next 1 0"], "&&", ["@This 1", "=", "@Next 1 1"], "&&", ["@This 2", "=", "@Next 1 2"], "&&", ["@This 3", "=", "@Next 1 3"], "&&", ["@This 4", "=", "@Next 1 4"], "&&", ["@This 5", "=", "@Next 1 5"]], false, [["@This 0", ["@This 1", "+", 1], "@This 2", "@This 3", "@This 4", "@This 5"]], [[2, "^", "@This 0"], "*", [3, "^", "@This 1"], "*", [5, "^", "@This 2"], "*", [7, "^", "@This 3"], "*", [11, "^", "@This 4"], "*", [13, "^", "@This 5"], "*", 3], [false, true]],
                    [2, [["@HDir", "<", 0], "&&", ["@This 0", "+", 2, "=", "@Next 1 0"], "&&", ["@This 1", "=", "@Next 1 1"], "&&", ["@This 2", "=", "@Next 1 2"], "&&", ["@This 3", "=", "@Next 1 3"], "&&", ["@This 4", "=", "@Next 1 4"], "&&", ["@This 5", "=", "@Next 1 5"]], false, [["@This 0", "@This 1", ["@This 2", "+", 1], "@This 3", "@This 4", "@This 5"]], [[2, "^", "@This 0"], "*", [3, "^", "@This 1"], "*", [5, "^", "@This 2"], "*", [7, "^", "@This 3"], "*", [11, "^", "@This 4"], "*", [13, "^", "@This 5"], "*", 5], [false, true]],
                    [2, [["@VDir", "<", 0], "&&", ["@This 0", "+", 2, "=", "@Next 1 0"], "&&", ["@This 1", "-", 1, "=", "@Next 1 1"], "&&", ["@This 2", "=", "@Next 1 2"], "&&", ["@This 3", "=", "@Next 1 3"], "&&", ["@This 4", "=", "@Next 1 4"], "&&", ["@This 5", "=", "@Next 1 5"]], false, [["@This 0", ["@This 1", "-", 1], "@This 2", ["@This 3", "+", 1], "@This 4", "@This 5"]], [[2, "^", "@This 0"], "*", [3, "^", "@This 1"], "*", [5, "^", "@This 2"], "*", [7, "^", "@This 3"], "*", [11, "^", "@This 4"], "*", [13, "^", "@This 5"], "*", 7, "/", 3], [false, true]]
                ];
                winConditions = [[2, 1, 2, 1, 0, 0]];
                document.documentElement.style.setProperty("background-image", "linear-gradient(#e6b5ff, #19004d)");
                document.documentElement.style.setProperty("--background-color", "linear-gradient(#db93ff, #200061)");
                document.documentElement.style.setProperty("--grid-color", "#330099");
                document.documentElement.style.setProperty("--tile-color", "#cb63ff");
                document.documentElement.style.setProperty("--text-color", "#2c0d4b");
            }
            else if (mode_vars[0] == 4) { // Eight-Directional Hard
                document.getElementById("2100_difficulty_text").innerHTML = "Eight-Directional Hard: rightwards is X + X, downwards is X + 2X, leftwards is X + 3X, upwards is 2X + 3X, northeast is X + 5X, southeast is 2X + 5X, southwest is X + 7X, northwest is 2X + 7X.";
                document.getElementById("2100_difficulty_text").style.setProperty("color", "#bc79ff");
                document.getElementById("2100_difficulty_decrease").style.setProperty("opacity", "block");
                document.getElementById("2100_difficulty_increase").style.setProperty("display", "block");
                displayRules("rules_text", ["h2", "Directional Merges (Eight-Directional Hard)"], ["h1", "2100"], ["p","The merge rules are different depending on which direction you're moving. On a rightwards move, merges occur between two equal tiles. On a downwards move, merges occur between an X tile and a 2X tile. On a leftwards move, merges occur between an X tile and a 3X tile. On an upwards move, merges occur between a 2X tile and a 3X tile. On a northeast move, merges occur between an X tile and a 5X tile. On a southeast move, merges occur between a 2X tile and a 5X tile. On a southwest move, merges occur between an X tile and a 7X tile. On a northwest move, merges occur between a 2X tile and a 7X tile. Get to the 2100 tile to win!"],
                ["p", "Spawning tiles: 1 (100%)"]);
                displayRules("gm_rules_text", ["h2", "Directional Merges (Eight-Directional Hard)"], ["h1", "2100"], ["p","The merge rules are different depending on which direction you're moving. On a rightwards move, merges occur between two equal tiles. On a downwards move, merges occur between an X tile and a 2X tile. On a leftwards move, merges occur between an X tile and a 3X tile. On an upwards move, merges occur between a 2X tile and a 3X tile. On a northeast move, merges occur between an X tile and a 5X tile. On a southeast move, merges occur between a 2X tile and a 5X tile. On a southwest move, merges occur between an X tile and a 7X tile. On a northwest move, merges occur between a 2X tile and a 7X tile. Get to the 2100 tile to win!"],
                ["p", "Spawning tiles: 1 (100%)"]);
                MergeRules = [
                    [2, [[["@HDir", ">", 0], "&&", ["@VDir", "=", 0]], "&&", ["@This 0", "=", "@Next 1 0"], "&&", ["@This 1", "=", "@Next 1 1"], "&&", ["@This 2", "=", "@Next 1 2"], "&&", ["@This 3", "=", "@Next 1 3"], "&&", ["@This 4", "=", "@Next 1 4"], "&&", ["@This 5", "=", "@Next 1 5"]], false, [[["@This 0", "+", 1], "@This 1", "@This 2", "@This 3", "@This 4", "@This 5"]], [[2, "^", "@This 0"], "*", [3, "^", "@This 1"], "*", [5, "^", "@This 2"], "*", [7, "^", "@This 3"], "*", [11, "^", "@This 4"], "*", [13, "^", "@This 5"], "*", 2], [false, true]],
                    [2, [[["@HDir", "=", 0], "&&", ["@VDir", ">", 0]], "&&", ["@This 0", "+", 1, "=", "@Next 1 0"], "&&", ["@This 1", "=", "@Next 1 1"], "&&", ["@This 2", "=", "@Next 1 2"], "&&", ["@This 3", "=", "@Next 1 3"], "&&", ["@This 4", "=", "@Next 1 4"], "&&", ["@This 5", "=", "@Next 1 5"]], false, [["@This 0", ["@This 1", "+", 1], "@This 2", "@This 3", "@This 4", "@This 5"]], [[2, "^", "@This 0"], "*", [3, "^", "@This 1"], "*", [5, "^", "@This 2"], "*", [7, "^", "@This 3"], "*", [11, "^", "@This 4"], "*", [13, "^", "@This 5"], "*", 3], [false, true]],
                    [2, [[["@HDir", "<", 0], "&&", ["@VDir", "=", 0]], "&&", ["@This 0", "=", "@Next 1 0"], "&&", ["@This 1", "+", 1, "=", "@Next 1 1"], "&&", ["@This 2", "=", "@Next 1 2"], "&&", ["@This 3", "=", "@Next 1 3"], "&&", ["@This 4", "=", "@Next 1 4"], "&&", ["@This 5", "=", "@Next 1 5"]], false, [[["@This 0", "+", 2], "@This 1", "@This 2", "@This 3", "@This 4", "@This 5"]], [[2, "^", "@This 0"], "*", [3, "^", "@This 1"], "*", [5, "^", "@This 2"], "*", [7, "^", "@This 3"], "*", [11, "^", "@This 4"], "*", [13, "^", "@This 5"], "*", 4], [false, true]],
                    [2, [[["@HDir", "=", 0], "&&", ["@VDir", "<", 0]], "&&", ["@This 0", "-", 1, "=", "@Next 1 0"], "&&", ["@This 1", "+", 1, "=", "@Next 1 1"], "&&", ["@This 2", "=", "@Next 1 2"], "&&", ["@This 3", "=", "@Next 1 3"], "&&", ["@This 4", "=", "@Next 1 4"], "&&", ["@This 5", "=", "@Next 1 5"]], false, [[["@This 0", "-", 1], "@This 1", ["@This 2", "+", 1], "@This 3", "@This 4", "@This 5"]], [[2, "^", "@This 0"], "*", [3, "^", "@This 1"], "*", [5, "^", "@This 2"], "*", [7, "^", "@This 3"], "*", [11, "^", "@This 4"], "*", [13, "^", "@This 5"], "*", 5, "/", 2], [false, true]],
                    [2, [[["@HDir", ">", 0], "&&", ["@VDir", "<", 0]], "&&", ["@This 0", "=", "@Next 1 0"], "&&", ["@This 1", "=", "@Next 1 1"], "&&", ["@This 2", "+", 1, "=", "@Next 1 2"], "&&", ["@This 3", "=", "@Next 1 3"], "&&", ["@This 4", "=", "@Next 1 4"], "&&", ["@This 5", "=", "@Next 1 5"]], false, [[["@This 0", "+", 1], ["@This 1", "+", 1], "@This 2", "@This 3", "@This 4", "@This 5"]], [[2, "^", "@This 0"], "*", [3, "^", "@This 1"], "*", [5, "^", "@This 2"], "*", [7, "^", "@This 3"], "*", [11, "^", "@This 4"], "*", [13, "^", "@This 5"], "*", 6], [false, true]],
                    [2, [[["@HDir", ">", 0], "&&", ["@VDir", ">", 0]], "&&", ["@This 0", "-", 1, "=", "@Next 1 0"], "&&", ["@This 1", "=", "@Next 1 1"], "&&", ["@This 2", "+", 1, "=", "@Next 1 2"], "&&", ["@This 3", "=", "@Next 1 3"], "&&", ["@This 4", "=", "@Next 1 4"], "&&", ["@This 5", "=", "@Next 1 5"]], false, [[["@This 0", "-", 1], "@This 1", "@This 2", ["@This 3", "+", 1], "@This 4", "@This 5"]], [[2, "^", "@This 0"], "*", [3, "^", "@This 1"], "*", [5, "^", "@This 2"], "*", [7, "^", "@This 3"], "*", [11, "^", "@This 4"], "*", [13, "^", "@This 5"], "*", 7, "/", 2], [false, true]],
                    [2, [[["@HDir", "<", 0], "&&", ["@VDir", ">", 0]], "&&", ["@This 0", "=", "@Next 1 0"], "&&", ["@This 1", "=", "@Next 1 1"], "&&", ["@This 2", "=", "@Next 1 2"], "&&", ["@This 3", "+", 1, "=", "@Next 1 3"], "&&", ["@This 4", "=", "@Next 1 4"], "&&", ["@This 5", "=", "@Next 1 5"]], false, [[["@This 0", "+", 3], "@This 1", "@This 2", "@This 3", "@This 4", "@This 5"]], [[2, "^", "@This 0"], "*", [3, "^", "@This 1"], "*", [5, "^", "@This 2"], "*", [7, "^", "@This 3"], "*", [11, "^", "@This 4"], "*", [13, "^", "@This 5"], "*", 8], [false, true]],
                    [2, [[["@HDir", "<", 0], "&&", ["@VDir", "<", 0]], "&&", ["@This 0", "-", 1, "=", "@Next 1 0"], "&&", ["@This 1", "=", "@Next 1 1"], "&&", ["@This 2", "=", "@Next 1 2"], "&&", ["@This 3", "+", 1, "=", "@Next 1 3"], "&&", ["@This 4", "=", "@Next 1 4"], "&&", ["@This 5", "=", "@Next 1 5"]], false, [[["@This 0", "-", 1], ["@This 1", "+", 2], "@This 2", "@This 3", "@This 4", "@This 5"]], [[2, "^", "@This 0"], "*", [3, "^", "@This 1"], "*", [5, "^", "@This 2"], "*", [7, "^", "@This 3"], "*", [11, "^", "@This 4"], "*", [13, "^", "@This 5"], "*", 9, "/", 2], [false, true]],
                ];
                winConditions = [[2, 1, 2, 1, 0, 0]];
                document.documentElement.style.setProperty("background-image", "linear-gradient(#e6b5ff, #19004d)");
                document.documentElement.style.setProperty("--background-color", "linear-gradient(#db93ff, #200061)");
                document.documentElement.style.setProperty("--grid-color", "#330099");
                document.documentElement.style.setProperty("--tile-color", "#cb63ff");
                document.documentElement.style.setProperty("--text-color", "#2c0d4b");
            }
            else if (mode_vars[0] == 5) { // Eight-Directional Extreme
                document.getElementById("2100_difficulty_text").innerHTML = "Eight-Directional Extreme: rightwards is X + X, downwards is X + 2X, leftwards is X + 4X, upwards is 3X + 4X, northeast is X + 8X, southeast is 3X + 8X, southwest is 5X + 8X, northwest is 7X + 8X.";
                document.getElementById("2100_difficulty_text").style.setProperty("color", "#ffad9c");
                document.getElementById("2100_difficulty_decrease").style.setProperty("opacity", "block");
                document.getElementById("2100_difficulty_increase").style.setProperty("display", "none");
                displayRules("rules_text", ["h2", "Directional Merges (Eight-Directional Extreme)"], ["h1", "2002"], ["p","The merge rules are different depending on which direction you're moving. On a rightwards move, merges occur between two equal tiles. On a downwards move, merges occur between an X tile and a 2X tile. On a leftwards move, merges occur between an X tile and a 4X tile. On an upwards move, merges occur between a 3X tile and a 4X tile. On a northeast move, merges occur between an X tile and an 8X tile. On a southeast move, merges occur between a 3X tile and an 8X tile. On a southwest move, merges occur between a 5X tile and an 8X tile. On a northwest move, merges occur between a 7X tile and an 8X tile. Get to the 2002 tile to win!"],
                ["p", "Spawning tiles: 1 (100%)"]);
                displayRules("gm_rules_text", ["h2", "Directional Merges (Eight-Directional Extreme)"], ["h1", "2002"], ["p","The merge rules are different depending on which direction you're moving. On a rightwards move, merges occur between two equal tiles. On a downwards move, merges occur between an X tile and a 2X tile. On a leftwards move, merges occur between an X tile and a 4X tile. On an upwards move, merges occur between a 3X tile and a 4X tile. On a northeast move, merges occur between an X tile and an 8X tile. On a southeast move, merges occur between a 3X tile and an 8X tile. On a southwest move, merges occur between a 5X tile and an 8X tile. On a northwest move, merges occur between a 7X tile and an 8X tile. Get to the 2002 tile to win!"],
                ["p", "Spawning tiles: 1 (100%)"]);
                MergeRules = [
                    [2, [[["@HDir", ">", 0], "&&", ["@VDir", "=", 0]], "&&", ["@This 0", "=", "@Next 1 0"], "&&", ["@This 1", "=", "@Next 1 1"], "&&", ["@This 2", "=", "@Next 1 2"], "&&", ["@This 3", "=", "@Next 1 3"], "&&", ["@This 4", "=", "@Next 1 4"], "&&", ["@This 5", "=", "@Next 1 5"]], false, [[["@This 0", "+", 1], "@This 1", "@This 2", "@This 3", "@This 4", "@This 5"]], [[2, "^", "@This 0"], "*", [3, "^", "@This 1"], "*", [5, "^", "@This 2"], "*", [7, "^", "@This 3"], "*", [11, "^", "@This 4"], "*", [13, "^", "@This 5"], "*", 2], [false, true]],
                    [2, [[["@HDir", "=", 0], "&&", ["@VDir", ">", 0]], "&&", ["@This 0", "+", 1, "=", "@Next 1 0"], "&&", ["@This 1", "=", "@Next 1 1"], "&&", ["@This 2", "=", "@Next 1 2"], "&&", ["@This 3", "=", "@Next 1 3"], "&&", ["@This 4", "=", "@Next 1 4"], "&&", ["@This 5", "=", "@Next 1 5"]], false, [["@This 0", ["@This 1", "+", 1], "@This 2", "@This 3", "@This 4", "@This 5"]], [[2, "^", "@This 0"], "*", [3, "^", "@This 1"], "*", [5, "^", "@This 2"], "*", [7, "^", "@This 3"], "*", [11, "^", "@This 4"], "*", [13, "^", "@This 5"], "*", 3], [false, true]],
                    [2, [[["@HDir", "<", 0], "&&", ["@VDir", "=", 0]], "&&", ["@This 0", "+", 2, "=", "@Next 1 0"], "&&", ["@This 1", "=", "@Next 1 1"], "&&", ["@This 2", "=", "@Next 1 2"], "&&", ["@This 3", "=", "@Next 1 3"], "&&", ["@This 4", "=", "@Next 1 4"], "&&", ["@This 5", "=", "@Next 1 5"]], false, [["@This 0", "@This 1", ["@This 2", "+", 1], "@This 3", "@This 4", "@This 5"]], [[2, "^", "@This 0"], "*", [3, "^", "@This 1"], "*", [5, "^", "@This 2"], "*", [7, "^", "@This 3"], "*", [11, "^", "@This 4"], "*", [13, "^", "@This 5"], "*", 5], [false, true]],
                    [2, [[["@HDir", "=", 0], "&&", ["@VDir", "<", 0]], "&&", ["@This 0", "+", 2, "=", "@Next 1 0"], "&&", ["@This 1", "-", 1, "=", "@Next 1 1"], "&&", ["@This 2", "=", "@Next 1 2"], "&&", ["@This 3", "=", "@Next 1 3"], "&&", ["@This 4", "=", "@Next 1 4"], "&&", ["@This 5", "=", "@Next 1 5"]], false, [["@This 0", ["@This 1", "-", 1], "@This 2", ["@This 3", "+", 1], "@This 4", "@This 5"]], [[2, "^", "@This 0"], "*", [3, "^", "@This 1"], "*", [5, "^", "@This 2"], "*", [7, "^", "@This 3"], "*", [11, "^", "@This 4"], "*", [13, "^", "@This 5"], "*", 7, "/", 3], [false, true]],
                    [2, [[["@HDir", ">", 0], "&&", ["@VDir", "<", 0]], "&&", ["@This 0", "+", 3, "=", "@Next 1 0"], "&&", ["@This 1", "=", "@Next 1 1"], "&&", ["@This 2", "=", "@Next 1 2"], "&&", ["@This 3", "=", "@Next 1 3"], "&&", ["@This 4", "=", "@Next 1 4"], "&&", ["@This 5", "=", "@Next 1 5"]], false, [["@This 0", ["@This 1", "+", 2], "@This 2", "@This 3", "@This 4", "@This 5"]], [[2, "^", "@This 0"], "*", [3, "^", "@This 1"], "*", [5, "^", "@This 2"], "*", [7, "^", "@This 3"], "*", [11, "^", "@This 4"], "*", [13, "^", "@This 5"], "*", 9], [false, true]],
                    [2, [[["@HDir", ">", 0], "&&", ["@VDir", ">", 0]], "&&", ["@This 0", "+", 3, "=", "@Next 1 0"], "&&", ["@This 1", "-", 1, "=", "@Next 1 1"], "&&", ["@This 2", "=", "@Next 1 2"], "&&", ["@This 3", "=", "@Next 1 3"], "&&", ["@This 4", "=", "@Next 1 4"], "&&", ["@This 5", "=", "@Next 1 5"]], false, [["@This 0", ["@This 1", "-", 1], "@This 2", "@This 3", ["@This 4", "+", 1], "@This 5"]], [[2, "^", "@This 0"], "*", [3, "^", "@This 1"], "*", [5, "^", "@This 2"], "*", [7, "^", "@This 3"], "*", [11, "^", "@This 4"], "*", [13, "^", "@This 5"], "*", 11, "/", 3], [false, true]],
                    [2, [[["@HDir", "<", 0], "&&", ["@VDir", ">", 0]], "&&", ["@This 0", "+", 3, "=", "@Next 1 0"], "&&", ["@This 1", "=", "@Next 1 1"], "&&", ["@This 2", "-", 1, "=", "@Next 1 2"], "&&", ["@This 3", "=", "@Next 1 3"], "&&", ["@This 4", "=", "@Next 1 4"], "&&", ["@This 5", "=", "@Next 1 5"]], false, [["@This 0", "@This 1", ["@This 2", "-", 1], "@This 3", "@This 4", ["@This 5", "+", 1]]], [[2, "^", "@This 0"], "*", [3, "^", "@This 1"], "*", [5, "^", "@This 2"], "*", [7, "^", "@This 3"], "*", [11, "^", "@This 4"], "*", [13, "^", "@This 5"], "*", 13, "/", 5], [false, true]],
                    [2, [[["@HDir", "<", 0], "&&", ["@VDir", "<", 0]], "&&", ["@This 0", "+", 3, "=", "@Next 1 0"], "&&", ["@This 1", "=", "@Next 1 1"], "&&", ["@This 2", "=", "@Next 1 2"], "&&", ["@This 3", "-", 1, "=", "@Next 1 3"], "&&", ["@This 4", "=", "@Next 1 4"], "&&", ["@This 5", "=", "@Next 1 5"]], false, [["@This 0", ["@This 1", "+", 1], ["@This 2", "+", 1], ["@This 3", "-", 1], "@This 4", "@This 5"]], [[2, "^", "@This 0"], "*", [3, "^", "@This 1"], "*", [5, "^", "@This 2"], "*", [7, "^", "@This 3"], "*", [11, "^", "@This 4"], "*", [13, "^", "@This 5"], "*", 15, "/", 7], [false, true]],
                ];
                winConditions = [[1, 0, 0, 1, 1, 1]];
                document.documentElement.style.setProperty("background-image", "linear-gradient(#ffa0a0, #bbbb00, #9c673b)");
                document.documentElement.style.setProperty("--background-color", "linear-gradient(#ff6c6c, #999900, #b87a47)");
                document.documentElement.style.setProperty("--grid-color", "#be7b43");
                document.documentElement.style.setProperty("--tile-color", "#e06b6b");
                document.documentElement.style.setProperty("--text-color", "#484800");
            }
        }
        else if (modifiers[5] == "4D") { // 4D grid. The modes here are the same as eight-directional, but with the 3D/4D directions replacing the diagonal directions.
            if (mode_vars[0] == 0) { // 4D Easy
                document.getElementById("2100_difficulty_text").innerHTML = "4D Easy: 2D directions are X + X, between-grid directions are X + 2X.";
                document.getElementById("2100_difficulty_text").style.setProperty("color", "#a0d4ff");
                document.getElementById("2100_difficulty_decrease").style.setProperty("display", "none");
                document.getElementById("2100_difficulty_increase").style.setProperty("display", "block");
                displayRules("rules_text", ["h2", "Directional Merges (4D Easy)"], ["h1", "1944"], ["p","The merge rules are different depending on which direction you're moving. On a move within a 2D grid, merges occur between two equal tiles. On a move between grids, merges occur between an X tile and a 2X tile, for any X. Get to the 1944 tile to win!"],
                ["p", "Spawning tiles: 1 (100%)"]);
                displayRules("gm_rules_text", ["h2", "Directional Merges (4D Easy)"], ["h1", "1944"], ["p","The merge rules are different depending on which direction you're moving. On a move within a 2D grid, merges occur between two equal tiles. On a move between grids, merges occur between an X tile and a 2X tile, for any X. Get to the 1944 tile to win!"],
                ["p", "Spawning tiles: 1 (100%)"]);
                MergeRules = [
                    [2, [["@HDir", "abs", "=", 1], "||", ["@VDir", "abs", "=", 1], "&&", ["@This 0", "=", "@Next 1 0"], "&&", ["@This 1", "=", "@Next 1 1"], "&&", ["@This 2", "=", "@Next 1 2"], "&&", ["@This 3", "=", "@Next 1 3"], "&&", ["@This 4", "=", "@Next 1 4"], "&&", ["@This 5", "=", "@Next 1 5"]], false, [[["@This 0", "+", 1], "@This 1", "@This 2", "@This 3", "@This 4", "@This 5"]], [[2, "^", "@This 0"], "*", [3, "^", "@This 1"], "*", [5, "^", "@This 2"], "*", [7, "^", "@This 3"], "*", [11, "^", "@This 4"], "*", [13, "^", "@This 5"], "*", 2], [false, true]],
                    [2, [["@HDir", "abs", ">", 1], "||", ["@VDir", "abs", ">", 1], "&&", ["@This 0", "+", 1, "=", "@Next 1 0"], "&&", ["@This 1", "=", "@Next 1 1"], "&&", ["@This 2", "=", "@Next 1 2"], "&&", ["@This 3", "=", "@Next 1 3"], "&&", ["@This 4", "=", "@Next 1 4"], "&&", ["@This 5", "=", "@Next 1 5"]], false, [["@This 0", ["@This 1", "+", 1], "@This 2", "@This 3", "@This 4", "@This 5"]], [[2, "^", "@This 0"], "*", [3, "^", "@This 1"], "*", [5, "^", "@This 2"], "*", [7, "^", "@This 3"], "*", [11, "^", "@This 4"], "*", [13, "^", "@This 5"], "*", 3], [false, true]]
                ];
                winConditions = [[3, 5, 0, 0, 0, 0]];
                document.documentElement.style.setProperty("background-image", "linear-gradient(#90cdff, #00447c)");
                document.documentElement.style.setProperty("--background-color", "linear-gradient(#73c0ff, #005eac)");
                document.documentElement.style.setProperty("--grid-color", "#125c99");
                document.documentElement.style.setProperty("--tile-color", "#3f89c6");
                document.documentElement.style.setProperty("--text-color", "#003159");
            }
            else if (mode_vars[0] == 1) { // Easy
                document.getElementById("2100_difficulty_text").innerHTML = "Easy: rightwards and downwards are X + X, leftwards and upwards are X + 2X. Moves between grids have the same merge rules as their corresponding moves within a grid.";
                document.getElementById("2100_difficulty_text").style.setProperty("color", "#a0d4ff");
                document.getElementById("2100_difficulty_decrease").style.setProperty("display", "block");
                document.getElementById("2100_difficulty_increase").style.setProperty("display", "block");
                displayRules("rules_text", ["h2", "Directional Merges (Easy)"], ["h1", "1944"], ["p","The merge rules are different depending on which direction you're moving. On a rightwards or downwards move, merges occur between two equal tiles. On a leftwards or upwards move, merges occur between an X tile and a 2X tile, for any X. Moves between grids have the same merge rules as their corresponding moves within a grid. Get to the 1944 tile to win!"],
                ["p", "Spawning tiles: 1 (100%)"]);
                displayRules("gm_rules_text", ["h2", "Directional Merges (Easy)"], ["h1", "1944"], ["p","The merge rules are different depending on which direction you're moving. On a rightwards or downwards move, merges occur between two equal tiles. On a leftwards or upwards move, merges occur between an X tile and a 2X tile, for any X. Moves between grids have the same merge rules as their corresponding moves within a grid. Get to the 1944 tile to win!"],
                ["p", "Spawning tiles: 1 (100%)"]);
                MergeRules = [
                    [2, [["@HDir", ">", 0], "||", ["@VDir", ">", 0], "&&", ["@This 0", "=", "@Next 1 0"], "&&", ["@This 1", "=", "@Next 1 1"], "&&", ["@This 2", "=", "@Next 1 2"], "&&", ["@This 3", "=", "@Next 1 3"], "&&", ["@This 4", "=", "@Next 1 4"], "&&", ["@This 5", "=", "@Next 1 5"]], false, [[["@This 0", "+", 1], "@This 1", "@This 2", "@This 3", "@This 4", "@This 5"]], [[2, "^", "@This 0"], "*", [3, "^", "@This 1"], "*", [5, "^", "@This 2"], "*", [7, "^", "@This 3"], "*", [11, "^", "@This 4"], "*", [13, "^", "@This 5"], "*", 2], [false, true]],
                    [2, [["@HDir", "<", 0], "||", ["@VDir", "<", 0], "&&", ["@This 0", "+", 1, "=", "@Next 1 0"], "&&", ["@This 1", "=", "@Next 1 1"], "&&", ["@This 2", "=", "@Next 1 2"], "&&", ["@This 3", "=", "@Next 1 3"], "&&", ["@This 4", "=", "@Next 1 4"], "&&", ["@This 5", "=", "@Next 1 5"]], false, [["@This 0", ["@This 1", "+", 1], "@This 2", "@This 3", "@This 4", "@This 5"]], [[2, "^", "@This 0"], "*", [3, "^", "@This 1"], "*", [5, "^", "@This 2"], "*", [7, "^", "@This 3"], "*", [11, "^", "@This 4"], "*", [13, "^", "@This 5"], "*", 3], [false, true]]
                ];
                winConditions = [[3, 5, 0, 0, 0, 0]];
                document.documentElement.style.setProperty("background-image", "linear-gradient(#90cdff, #00447c)");
                document.documentElement.style.setProperty("--background-color", "linear-gradient(#73c0ff, #005eac)");
                document.documentElement.style.setProperty("--grid-color", "#125c99");
                document.documentElement.style.setProperty("--tile-color", "#3f89c6");
                document.documentElement.style.setProperty("--text-color", "#003159");
            }
            else if (mode_vars[0] == 2) { // Medium
                document.getElementById("2100_difficulty_text").innerHTML = "Medium: rightwards is X + X, downwards is X + 2X, leftwards is X + 3X, upwards is 2X + 3X. Moves between grids have the same merge rules as their corresponding moves within a grid.";
                document.getElementById("2100_difficulty_text").style.setProperty("color", "#7573ff");
                document.getElementById("2100_difficulty_decrease").style.setProperty("display", "block");
                document.getElementById("2100_difficulty_increase").style.setProperty("display", "block");
                displayRules("rules_text", ["h2", "Directional Merges (Medium)"], ["h1", "2160"], ["p","The merge rules are different depending on which direction you're moving. On a rightwards move, merges occur between two equal tiles. On a downwards move, merges occur between an X tile and a 2X tile, for any X. On a leftwards move, merges occur between an X tile and a 3X tile, for any X. On an upwards move, merges occur between a 2X tile and a 3X tile, for any X. Moves between grids have the same merge rules as their corresponding moves within a grid. Get to the 2160 tile to win!"],
                ["p", "Spawning tiles: 1 (100%)"]);
                displayRules("gm_rules_text", ["h2", "Directional Merges (Medium)"], ["h1", "2160"], ["p","The merge rules are different depending on which direction you're moving. On a rightwards move, merges occur between two equal tiles. On a downwards move, merges occur between an X tile and a 2X tile, for any X. On a leftwards move, merges occur between an X tile and a 3X tile, for any X. On an upwards move, merges occur between a 2X tile and a 3X tile, for any X. Moves between grids have the same merge rules as their corresponding moves within a grid. Get to the 2160 tile to win!"],
                ["p", "Spawning tiles: 1 (100%)"]);
                MergeRules = [
                    [2, [["@HDir", ">", 0], "&&", ["@This 0", "=", "@Next 1 0"], "&&", ["@This 1", "=", "@Next 1 1"], "&&", ["@This 2", "=", "@Next 1 2"], "&&", ["@This 3", "=", "@Next 1 3"], "&&", ["@This 4", "=", "@Next 1 4"], "&&", ["@This 5", "=", "@Next 1 5"]], false, [[["@This 0", "+", 1], "@This 1", "@This 2", "@This 3", "@This 4", "@This 5"]], [[2, "^", "@This 0"], "*", [3, "^", "@This 1"], "*", [5, "^", "@This 2"], "*", [7, "^", "@This 3"], "*", [11, "^", "@This 4"], "*", [13, "^", "@This 5"], "*", 2], [false, true]],
                    [2, [["@VDir", ">", 0], "&&", ["@This 0", "+", 1, "=", "@Next 1 0"], "&&", ["@This 1", "=", "@Next 1 1"], "&&", ["@This 2", "=", "@Next 1 2"], "&&", ["@This 3", "=", "@Next 1 3"], "&&", ["@This 4", "=", "@Next 1 4"], "&&", ["@This 5", "=", "@Next 1 5"]], false, [["@This 0", ["@This 1", "+", 1], "@This 2", "@This 3", "@This 4", "@This 5"]], [[2, "^", "@This 0"], "*", [3, "^", "@This 1"], "*", [5, "^", "@This 2"], "*", [7, "^", "@This 3"], "*", [11, "^", "@This 4"], "*", [13, "^", "@This 5"], "*", 3], [false, true]],
                    [2, [["@HDir", "<", 0], "&&", ["@This 0", "=", "@Next 1 0"], "&&", ["@This 1", "+", 1, "=", "@Next 1 1"], "&&", ["@This 2", "=", "@Next 1 2"], "&&", ["@This 3", "=", "@Next 1 3"], "&&", ["@This 4", "=", "@Next 1 4"], "&&", ["@This 5", "=", "@Next 1 5"]], false, [[["@This 0", "+", 2], "@This 1", "@This 2", "@This 3", "@This 4", "@This 5"]], [[2, "^", "@This 0"], "*", [3, "^", "@This 1"], "*", [5, "^", "@This 2"], "*", [7, "^", "@This 3"], "*", [11, "^", "@This 4"], "*", [13, "^", "@This 5"], "*", 4], [false, true]],
                    [2, [["@VDir", "<", 0], "&&", ["@This 0", "-", 1, "=", "@Next 1 0"], "&&", ["@This 1", "+", 1, "=", "@Next 1 1"], "&&", ["@This 2", "=", "@Next 1 2"], "&&", ["@This 3", "=", "@Next 1 3"], "&&", ["@This 4", "=", "@Next 1 4"], "&&", ["@This 5", "=", "@Next 1 5"]], false, [[["@This 0", "-", 1], "@This 1", ["@This 2", "+", 1], "@This 3", "@This 4", "@This 5"]], [[2, "^", "@This 0"], "*", [3, "^", "@This 1"], "*", [5, "^", "@This 2"], "*", [7, "^", "@This 3"], "*", [11, "^", "@This 4"], "*", [13, "^", "@This 5"], "*", 5, "/", 2], [false, true]]
                ];
                winConditions = [[4, 3, 1, 0, 0, 0]];
                document.documentElement.style.setProperty("background-image", "linear-gradient(#c2acff, #004f4f)");
                document.documentElement.style.setProperty("--background-color", "linear-gradient(#926aff, #008383)");
                document.documentElement.style.setProperty("--grid-color", "#218383");
                document.documentElement.style.setProperty("--tile-color", "#977ce1");
                document.documentElement.style.setProperty("--text-color", "#23144e");
            }
            else if (mode_vars[0] == 3) { // Hard
                document.getElementById("2100_difficulty_text").innerHTML = "Hard: rightwards is X + X, downwards is X + 2X, leftwards is X + 4X, upwards is 3X + 4X. Moves between grids have the same merge rules as their corresponding moves within a grid.";
                document.getElementById("2100_difficulty_text").style.setProperty("color", "#bc79ff");
                document.getElementById("2100_difficulty_decrease").style.setProperty("opacity", "block");
                document.getElementById("2100_difficulty_increase").style.setProperty("display", "block");
                displayRules("rules_text", ["h2", "Directional Merges (Hard)"], ["h1", "2100"], ["p","The merge rules are different depending on which direction you're moving. On a rightwards move, merges occur between two equal tiles. On a downwards move, merges occur between an X tile and a 2X tile, for any X. On a leftwards move, merges occur between an X tile and a 4X tile, for any X. On an upwards move, merges occur between a 3X tile and a 4X tile, for any X. Moves between grids have the same merge rules as their corresponding moves within a grid. Get to the 2100 tile to win!"],
                ["p", "Spawning tiles: 1 (100%)"]);
                displayRules("gm_rules_text", ["h2", "Directional Merges (Hard)"], ["h1", "2100"], ["p","The merge rules are different depending on which direction you're moving. On a rightwards move, merges occur between two equal tiles. On a downwards move, merges occur between an X tile and a 2X tile, for any X. On a leftwards move, merges occur between an X tile and a 4X tile, for any X. On an upwards move, merges occur between a 3X tile and a 4X tile, for any X. Moves between grids have the same merge rules as their corresponding moves within a grid. Get to the 2100 tile to win!"],
                ["p", "Spawning tiles: 1 (100%)"]);
                MergeRules = [
                    [2, [["@HDir", ">", 0], "&&", ["@This 0", "=", "@Next 1 0"], "&&", ["@This 1", "=", "@Next 1 1"], "&&", ["@This 2", "=", "@Next 1 2"], "&&", ["@This 3", "=", "@Next 1 3"], "&&", ["@This 4", "=", "@Next 1 4"], "&&", ["@This 5", "=", "@Next 1 5"]], false, [[["@This 0", "+", 1], "@This 1", "@This 2", "@This 3", "@This 4", "@This 5"]], [[2, "^", "@This 0"], "*", [3, "^", "@This 1"], "*", [5, "^", "@This 2"], "*", [7, "^", "@This 3"], "*", [11, "^", "@This 4"], "*", [13, "^", "@This 5"], "*", 2], [false, true]],
                    [2, [["@VDir", ">", 0], "&&", ["@This 0", "+", 1, "=", "@Next 1 0"], "&&", ["@This 1", "=", "@Next 1 1"], "&&", ["@This 2", "=", "@Next 1 2"], "&&", ["@This 3", "=", "@Next 1 3"], "&&", ["@This 4", "=", "@Next 1 4"], "&&", ["@This 5", "=", "@Next 1 5"]], false, [["@This 0", ["@This 1", "+", 1], "@This 2", "@This 3", "@This 4", "@This 5"]], [[2, "^", "@This 0"], "*", [3, "^", "@This 1"], "*", [5, "^", "@This 2"], "*", [7, "^", "@This 3"], "*", [11, "^", "@This 4"], "*", [13, "^", "@This 5"], "*", 3], [false, true]],
                    [2, [["@HDir", "<", 0], "&&", ["@This 0", "+", 2, "=", "@Next 1 0"], "&&", ["@This 1", "=", "@Next 1 1"], "&&", ["@This 2", "=", "@Next 1 2"], "&&", ["@This 3", "=", "@Next 1 3"], "&&", ["@This 4", "=", "@Next 1 4"], "&&", ["@This 5", "=", "@Next 1 5"]], false, [["@This 0", "@This 1", ["@This 2", "+", 1], "@This 3", "@This 4", "@This 5"]], [[2, "^", "@This 0"], "*", [3, "^", "@This 1"], "*", [5, "^", "@This 2"], "*", [7, "^", "@This 3"], "*", [11, "^", "@This 4"], "*", [13, "^", "@This 5"], "*", 5], [false, true]],
                    [2, [["@VDir", "<", 0], "&&", ["@This 0", "+", 2, "=", "@Next 1 0"], "&&", ["@This 1", "-", 1, "=", "@Next 1 1"], "&&", ["@This 2", "=", "@Next 1 2"], "&&", ["@This 3", "=", "@Next 1 3"], "&&", ["@This 4", "=", "@Next 1 4"], "&&", ["@This 5", "=", "@Next 1 5"]], false, [["@This 0", ["@This 1", "-", 1], "@This 2", ["@This 3", "+", 1], "@This 4", "@This 5"]], [[2, "^", "@This 0"], "*", [3, "^", "@This 1"], "*", [5, "^", "@This 2"], "*", [7, "^", "@This 3"], "*", [11, "^", "@This 4"], "*", [13, "^", "@This 5"], "*", 7, "/", 3], [false, true]]
                ];
                winConditions = [[2, 1, 2, 1, 0, 0]];
                document.documentElement.style.setProperty("background-image", "linear-gradient(#e6b5ff, #19004d)");
                document.documentElement.style.setProperty("--background-color", "linear-gradient(#db93ff, #200061)");
                document.documentElement.style.setProperty("--grid-color", "#330099");
                document.documentElement.style.setProperty("--tile-color", "#cb63ff");
                document.documentElement.style.setProperty("--text-color", "#2c0d4b");
            }
            else if (mode_vars[0] == 4) { // 4D Hard
                document.getElementById("2100_difficulty_text").innerHTML = "4D Hard: rightwards is X + X, downwards is X + 2X, leftwards is X + 3X, upwards is 2X + 3X, 4D-right is X + 5X, 4D-down is 2X + 5X, 4D-left is X + 7X, 4D-up is 2X + 7X.";
                document.getElementById("2100_difficulty_text").style.setProperty("color", "#bc79ff");
                document.getElementById("2100_difficulty_decrease").style.setProperty("opacity", "block");
                document.getElementById("2100_difficulty_increase").style.setProperty("display", "block");
                displayRules("rules_text", ["h2", "Directional Merges (4D Hard)"], ["h1", "2100"], ["p","The merge rules are different depending on which direction you're moving. On a rightwards move, merges occur between two equal tiles. On a downwards move, merges occur between an X tile and a 2X tile. On a leftwards move, merges occur between an X tile and a 3X tile. On an upwards move, merges occur between a 2X tile and a 3X tile. On a 4D-right move, merges occur between an X tile and a 5X tile. On a 4D-down move, merges occur between a 2X tile and a 5X tile. On a 4D-left move, merges occur between an X tile and a 7X tile. On a 4D-up move, merges occur between a 2X tile and a 7X tile. Get to the 2100 tile to win!"],
                ["p", "Spawning tiles: 1 (100%)"]);
                displayRules("gm_rules_text", ["h2", "Directional Merges (4D Hard)"], ["h1", "2100"], ["p","The merge rules are different depending on which direction you're moving. On a rightwards move, merges occur between two equal tiles. On a downwards move, merges occur between an X tile and a 2X tile. On a leftwards move, merges occur between an X tile and a 3X tile. On an upwards move, merges occur between a 2X tile and a 3X tile. On a 4D-right move, merges occur between an X tile and a 5X tile. On a 4D-down move, merges occur between a 2X tile and a 5X tile. On a 4D-left move, merges occur between an X tile and a 7X tile. On a 4D-up move, merges occur between a 2X tile and a 7X tile. Get to the 2100 tile to win!"],
                ["p", "Spawning tiles: 1 (100%)"]);
                MergeRules = [
                    [2, [["@HDir", "=", 1], "&&", ["@This 0", "=", "@Next 1 0"], "&&", ["@This 1", "=", "@Next 1 1"], "&&", ["@This 2", "=", "@Next 1 2"], "&&", ["@This 3", "=", "@Next 1 3"], "&&", ["@This 4", "=", "@Next 1 4"], "&&", ["@This 5", "=", "@Next 1 5"]], false, [[["@This 0", "+", 1], "@This 1", "@This 2", "@This 3", "@This 4", "@This 5"]], [[2, "^", "@This 0"], "*", [3, "^", "@This 1"], "*", [5, "^", "@This 2"], "*", [7, "^", "@This 3"], "*", [11, "^", "@This 4"], "*", [13, "^", "@This 5"], "*", 2], [false, true]],
                    [2, [["@VDir", "=", 1], "&&", ["@This 0", "+", 1, "=", "@Next 1 0"], "&&", ["@This 1", "=", "@Next 1 1"], "&&", ["@This 2", "=", "@Next 1 2"], "&&", ["@This 3", "=", "@Next 1 3"], "&&", ["@This 4", "=", "@Next 1 4"], "&&", ["@This 5", "=", "@Next 1 5"]], false, [["@This 0", ["@This 1", "+", 1], "@This 2", "@This 3", "@This 4", "@This 5"]], [[2, "^", "@This 0"], "*", [3, "^", "@This 1"], "*", [5, "^", "@This 2"], "*", [7, "^", "@This 3"], "*", [11, "^", "@This 4"], "*", [13, "^", "@This 5"], "*", 3], [false, true]],
                    [2, [["@HDir", "=", -1], "&&", ["@This 0", "=", "@Next 1 0"], "&&", ["@This 1", "+", 1, "=", "@Next 1 1"], "&&", ["@This 2", "=", "@Next 1 2"], "&&", ["@This 3", "=", "@Next 1 3"], "&&", ["@This 4", "=", "@Next 1 4"], "&&", ["@This 5", "=", "@Next 1 5"]], false, [[["@This 0", "+", 2], "@This 1", "@This 2", "@This 3", "@This 4", "@This 5"]], [[2, "^", "@This 0"], "*", [3, "^", "@This 1"], "*", [5, "^", "@This 2"], "*", [7, "^", "@This 3"], "*", [11, "^", "@This 4"], "*", [13, "^", "@This 5"], "*", 4], [false, true]],
                    [2, [["@VDir", "=", -1], "&&", ["@This 0", "-", 1, "=", "@Next 1 0"], "&&", ["@This 1", "+", 1, "=", "@Next 1 1"], "&&", ["@This 2", "=", "@Next 1 2"], "&&", ["@This 3", "=", "@Next 1 3"], "&&", ["@This 4", "=", "@Next 1 4"], "&&", ["@This 5", "=", "@Next 1 5"]], false, [[["@This 0", "-", 1], "@This 1", ["@This 2", "+", 1], "@This 3", "@This 4", "@This 5"]], [[2, "^", "@This 0"], "*", [3, "^", "@This 1"], "*", [5, "^", "@This 2"], "*", [7, "^", "@This 3"], "*", [11, "^", "@This 4"], "*", [13, "^", "@This 5"], "*", 5, "/", 2], [false, true]],
                    [2, [["@HDir", ">", 1], "&&", ["@This 0", "=", "@Next 1 0"], "&&", ["@This 1", "=", "@Next 1 1"], "&&", ["@This 2", "+", 1, "=", "@Next 1 2"], "&&", ["@This 3", "=", "@Next 1 3"], "&&", ["@This 4", "=", "@Next 1 4"], "&&", ["@This 5", "=", "@Next 1 5"]], false, [[["@This 0", "+", 1], ["@This 1", "+", 1], "@This 2", "@This 3", "@This 4", "@This 5"]], [[2, "^", "@This 0"], "*", [3, "^", "@This 1"], "*", [5, "^", "@This 2"], "*", [7, "^", "@This 3"], "*", [11, "^", "@This 4"], "*", [13, "^", "@This 5"], "*", 6], [false, true]],
                    [2, [["@VDir", ">", 1], "&&", ["@This 0", "-", 1, "=", "@Next 1 0"], "&&", ["@This 1", "=", "@Next 1 1"], "&&", ["@This 2", "+", 1, "=", "@Next 1 2"], "&&", ["@This 3", "=", "@Next 1 3"], "&&", ["@This 4", "=", "@Next 1 4"], "&&", ["@This 5", "=", "@Next 1 5"]], false, [[["@This 0", "-", 1], "@This 1", "@This 2", ["@This 3", "+", 1], "@This 4", "@This 5"]], [[2, "^", "@This 0"], "*", [3, "^", "@This 1"], "*", [5, "^", "@This 2"], "*", [7, "^", "@This 3"], "*", [11, "^", "@This 4"], "*", [13, "^", "@This 5"], "*", 7, "/", 2], [false, true]],
                    [2, [["@HDir", "<", -1], "&&", ["@This 0", "=", "@Next 1 0"], "&&", ["@This 1", "=", "@Next 1 1"], "&&", ["@This 2", "=", "@Next 1 2"], "&&", ["@This 3", "+", 1, "=", "@Next 1 3"], "&&", ["@This 4", "=", "@Next 1 4"], "&&", ["@This 5", "=", "@Next 1 5"]], false, [[["@This 0", "+", 3], "@This 1", "@This 2", "@This 3", "@This 4", "@This 5"]], [[2, "^", "@This 0"], "*", [3, "^", "@This 1"], "*", [5, "^", "@This 2"], "*", [7, "^", "@This 3"], "*", [11, "^", "@This 4"], "*", [13, "^", "@This 5"], "*", 8], [false, true]],
                    [2, [["@VDir", "<", -1], "&&", ["@This 0", "-", 1, "=", "@Next 1 0"], "&&", ["@This 1", "=", "@Next 1 1"], "&&", ["@This 2", "=", "@Next 1 2"], "&&", ["@This 3", "+", 1, "=", "@Next 1 3"], "&&", ["@This 4", "=", "@Next 1 4"], "&&", ["@This 5", "=", "@Next 1 5"]], false, [[["@This 0", "-", 1], ["@This 1", "+", 2], "@This 2", "@This 3", "@This 4", "@This 5"]], [[2, "^", "@This 0"], "*", [3, "^", "@This 1"], "*", [5, "^", "@This 2"], "*", [7, "^", "@This 3"], "*", [11, "^", "@This 4"], "*", [13, "^", "@This 5"], "*", 9, "/", 2], [false, true]],
                ];
                winConditions = [[2, 1, 2, 1, 0, 0]];
                document.documentElement.style.setProperty("background-image", "linear-gradient(#e6b5ff, #19004d)");
                document.documentElement.style.setProperty("--background-color", "linear-gradient(#db93ff, #200061)");
                document.documentElement.style.setProperty("--grid-color", "#330099");
                document.documentElement.style.setProperty("--tile-color", "#cb63ff");
                document.documentElement.style.setProperty("--text-color", "#2c0d4b");
            }
            else if (mode_vars[0] == 5) { // 4D Extreme
                document.getElementById("2100_difficulty_text").innerHTML = "4D Extreme: rightwards is X + X, downwards is X + 2X, leftwards is X + 4X, upwards is 3X + 4X, 4D-right is X + 8X, 4D-down is 3X + 8X, 4D-left is 5X + 8X, 4D-up is 7X + 8X.";
                document.getElementById("2100_difficulty_text").style.setProperty("color", "#ffad9c");
                document.getElementById("2100_difficulty_decrease").style.setProperty("opacity", "block");
                document.getElementById("2100_difficulty_increase").style.setProperty("display", "none");
                displayRules("rules_text", ["h2", "Directional Merges (4D Extreme)"], ["h1", "2002"], ["p","The merge rules are different depending on which direction you're moving. On a rightwards move, merges occur between two equal tiles. On a downwards move, merges occur between an X tile and a 2X tile. On a leftwards move, merges occur between an X tile and a 4X tile. On an upwards move, merges occur between a 3X tile and a 4X tile. On a 4D-right move, merges occur between an X tile and an 8X tile. On a 4D-down move, merges occur between a 3X tile and an 8X tile. On a 4D-left move, merges occur between a 5X tile and an 8X tile. On a 4D-up move, merges occur between a 7X tile and an 8X tile. Get to the 2002 tile to win!"],
                ["p", "Spawning tiles: 1 (100%)"]);
                displayRules("gm_rules_text", ["h2", "Directional Merges (4D Extreme)"], ["h1", "2002"], ["p","The merge rules are different depending on which direction you're moving. On a rightwards move, merges occur between two equal tiles. On a downwards move, merges occur between an X tile and a 2X tile. On a leftwards move, merges occur between an X tile and a 4X tile. On an upwards move, merges occur between a 3X tile and a 4X tile. On a 4D-right move, merges occur between an X tile and an 8X tile. On a 4D-down move, merges occur between a 3X tile and an 8X tile. On a 4D-left move, merges occur between a 5X tile and an 8X tile. On a 4D-up move, merges occur between a 7X tile and an 8X tile. Get to the 2002 tile to win!"],
                ["p", "Spawning tiles: 1 (100%)"]);
                MergeRules = [
                    [2, [["@HDir", "=", 1], "&&", ["@This 0", "=", "@Next 1 0"], "&&", ["@This 1", "=", "@Next 1 1"], "&&", ["@This 2", "=", "@Next 1 2"], "&&", ["@This 3", "=", "@Next 1 3"], "&&", ["@This 4", "=", "@Next 1 4"], "&&", ["@This 5", "=", "@Next 1 5"]], false, [[["@This 0", "+", 1], "@This 1", "@This 2", "@This 3", "@This 4", "@This 5"]], [[2, "^", "@This 0"], "*", [3, "^", "@This 1"], "*", [5, "^", "@This 2"], "*", [7, "^", "@This 3"], "*", [11, "^", "@This 4"], "*", [13, "^", "@This 5"], "*", 2], [false, true]],
                    [2, [["@VDir", "=", 1], "&&", ["@This 0", "+", 1, "=", "@Next 1 0"], "&&", ["@This 1", "=", "@Next 1 1"], "&&", ["@This 2", "=", "@Next 1 2"], "&&", ["@This 3", "=", "@Next 1 3"], "&&", ["@This 4", "=", "@Next 1 4"], "&&", ["@This 5", "=", "@Next 1 5"]], false, [["@This 0", ["@This 1", "+", 1], "@This 2", "@This 3", "@This 4", "@This 5"]], [[2, "^", "@This 0"], "*", [3, "^", "@This 1"], "*", [5, "^", "@This 2"], "*", [7, "^", "@This 3"], "*", [11, "^", "@This 4"], "*", [13, "^", "@This 5"], "*", 3], [false, true]],
                    [2, [["@HDir", "=", -1], "&&", ["@This 0", "+", 2, "=", "@Next 1 0"], "&&", ["@This 1", "=", "@Next 1 1"], "&&", ["@This 2", "=", "@Next 1 2"], "&&", ["@This 3", "=", "@Next 1 3"], "&&", ["@This 4", "=", "@Next 1 4"], "&&", ["@This 5", "=", "@Next 1 5"]], false, [["@This 0", "@This 1", ["@This 2", "+", 1], "@This 3", "@This 4", "@This 5"]], [[2, "^", "@This 0"], "*", [3, "^", "@This 1"], "*", [5, "^", "@This 2"], "*", [7, "^", "@This 3"], "*", [11, "^", "@This 4"], "*", [13, "^", "@This 5"], "*", 5], [false, true]],
                    [2, [["@VDir", "=", -1], "&&", ["@This 0", "+", 2, "=", "@Next 1 0"], "&&", ["@This 1", "-", 1, "=", "@Next 1 1"], "&&", ["@This 2", "=", "@Next 1 2"], "&&", ["@This 3", "=", "@Next 1 3"], "&&", ["@This 4", "=", "@Next 1 4"], "&&", ["@This 5", "=", "@Next 1 5"]], false, [["@This 0", ["@This 1", "-", 1], "@This 2", ["@This 3", "+", 1], "@This 4", "@This 5"]], [[2, "^", "@This 0"], "*", [3, "^", "@This 1"], "*", [5, "^", "@This 2"], "*", [7, "^", "@This 3"], "*", [11, "^", "@This 4"], "*", [13, "^", "@This 5"], "*", 7, "/", 3], [false, true]],
                    [2, [["@HDir", ">", 1], "&&", ["@This 0", "+", 3, "=", "@Next 1 0"], "&&", ["@This 1", "=", "@Next 1 1"], "&&", ["@This 2", "=", "@Next 1 2"], "&&", ["@This 3", "=", "@Next 1 3"], "&&", ["@This 4", "=", "@Next 1 4"], "&&", ["@This 5", "=", "@Next 1 5"]], false, [["@This 0", ["@This 1", "+", 2], "@This 2", "@This 3", "@This 4", "@This 5"]], [[2, "^", "@This 0"], "*", [3, "^", "@This 1"], "*", [5, "^", "@This 2"], "*", [7, "^", "@This 3"], "*", [11, "^", "@This 4"], "*", [13, "^", "@This 5"], "*", 9], [false, true]],
                    [2, [["@VDir", ">", 1], "&&", ["@This 0", "+", 3, "=", "@Next 1 0"], "&&", ["@This 1", "-", 1, "=", "@Next 1 1"], "&&", ["@This 2", "=", "@Next 1 2"], "&&", ["@This 3", "=", "@Next 1 3"], "&&", ["@This 4", "=", "@Next 1 4"], "&&", ["@This 5", "=", "@Next 1 5"]], false, [["@This 0", ["@This 1", "-", 1], "@This 2", "@This 3", ["@This 4", "+", 1], "@This 5"]], [[2, "^", "@This 0"], "*", [3, "^", "@This 1"], "*", [5, "^", "@This 2"], "*", [7, "^", "@This 3"], "*", [11, "^", "@This 4"], "*", [13, "^", "@This 5"], "*", 11, "/", 3], [false, true]],
                    [2, [["@HDir", "<", -1], "&&", ["@This 0", "+", 3, "=", "@Next 1 0"], "&&", ["@This 1", "=", "@Next 1 1"], "&&", ["@This 2", "-", 1, "=", "@Next 1 2"], "&&", ["@This 3", "=", "@Next 1 3"], "&&", ["@This 4", "=", "@Next 1 4"], "&&", ["@This 5", "=", "@Next 1 5"]], false, [["@This 0", "@This 1", ["@This 2", "-", 1], "@This 3", "@This 4", ["@This 5", "+", 1]]], [[2, "^", "@This 0"], "*", [3, "^", "@This 1"], "*", [5, "^", "@This 2"], "*", [7, "^", "@This 3"], "*", [11, "^", "@This 4"], "*", [13, "^", "@This 5"], "*", 13, "/", 5], [false, true]],
                    [2, [["@VDir", "<", -1], "&&", ["@This 0", "+", 3, "=", "@Next 1 0"], "&&", ["@This 1", "=", "@Next 1 1"], "&&", ["@This 2", "=", "@Next 1 2"], "&&", ["@This 3", "-", 1, "=", "@Next 1 3"], "&&", ["@This 4", "=", "@Next 1 4"], "&&", ["@This 5", "=", "@Next 1 5"]], false, [["@This 0", ["@This 1", "+", 1], ["@This 2", "+", 1], ["@This 3", "-", 1], "@This 4", "@This 5"]], [[2, "^", "@This 0"], "*", [3, "^", "@This 1"], "*", [5, "^", "@This 2"], "*", [7, "^", "@This 3"], "*", [11, "^", "@This 4"], "*", [13, "^", "@This 5"], "*", 15, "/", 7], [false, true]],
                ];
                winConditions = [[1, 0, 0, 1, 1, 1]];
                document.documentElement.style.setProperty("background-image", "linear-gradient(#ffa0a0, #bbbb00, #9c673b)");
                document.documentElement.style.setProperty("--background-color", "linear-gradient(#ff6c6c, #999900, #b87a47)");
                document.documentElement.style.setProperty("--grid-color", "#be7b43");
                document.documentElement.style.setProperty("--tile-color", "#e06b6b");
                document.documentElement.style.setProperty("--text-color", "#484800");
            }
        }
        else if (modifiers[5] == "Hexagon") { // Hexagonal grid, which has to do its own thing from the rest since its directions are different. Hexa-diagonal directions always allow both of the merges allowed by their constituents, because I'm not going to implement a mode of this with twelve independent directions and primes up to 23
            if (mode_vars[0] == 1) { // Hexagonal Easy
                document.getElementById("2100_difficulty_text").innerHTML = "Hexagonal Easy: Any rightwards direction is X + X, any leftwards direction is X + 2X.";
                document.getElementById("2100_difficulty_text").style.setProperty("color", "#a0d4ff");
                document.getElementById("2100_difficulty_decrease").style.setProperty("display", "none");
                document.getElementById("2100_difficulty_increase").style.setProperty("display", "block");
                displayRules("rules_text", ["h2", "Directional Merges (Hexagonal Easy)"], ["h1", "1944"], ["p","The merge rules are different depending on which direction you're moving. On any rightwards move, merges occur between two equal tiles. On any leftwards move, merges occur between an X tile and a 2X tile, for any X. Get to the 1944 tile to win!"],
                ["p", "Spawning tiles: 1 (100%)"]);
                displayRules("gm_rules_text", ["h2", "Directional Merges (Hexagonal Easy)"], ["h1", "1944"], ["p","The merge rules are different depending on which direction you're moving. On any rightwards move, merges occur between two equal tiles. On any leftwards move, merges occur between an X tile and a 2X tile, for any X. Get to the 1944 tile to win!"],
                ["p", "Spawning tiles: 1 (100%)"]);
                MergeRules = [
                    [2, [["@HDir", ">=", 0], "&&", ["@This 0", "=", "@Next 1 0"], "&&", ["@This 1", "=", "@Next 1 1"], "&&", ["@This 2", "=", "@Next 1 2"], "&&", ["@This 3", "=", "@Next 1 3"], "&&", ["@This 4", "=", "@Next 1 4"], "&&", ["@This 5", "=", "@Next 1 5"]], false, [[["@This 0", "+", 1], "@This 1", "@This 2", "@This 3", "@This 4", "@This 5"]], [[2, "^", "@This 0"], "*", [3, "^", "@This 1"], "*", [5, "^", "@This 2"], "*", [7, "^", "@This 3"], "*", [11, "^", "@This 4"], "*", [13, "^", "@This 5"], "*", 2], [false, true]],
                    [2, [["@HDir", "<=", 0], "&&", ["@This 0", "+", 1, "=", "@Next 1 0"], "&&", ["@This 1", "=", "@Next 1 1"], "&&", ["@This 2", "=", "@Next 1 2"], "&&", ["@This 3", "=", "@Next 1 3"], "&&", ["@This 4", "=", "@Next 1 4"], "&&", ["@This 5", "=", "@Next 1 5"]], false, [["@This 0", ["@This 1", "+", 1], "@This 2", "@This 3", "@This 4", "@This 5"]], [[2, "^", "@This 0"], "*", [3, "^", "@This 1"], "*", [5, "^", "@This 2"], "*", [7, "^", "@This 3"], "*", [11, "^", "@This 4"], "*", [13, "^", "@This 5"], "*", 3], [false, true]]
                ];
                winConditions = [[3, 5, 0, 0, 0, 0]];
                document.documentElement.style.setProperty("background-image", "linear-gradient(#90cdff, #00447c)");
                document.documentElement.style.setProperty("--background-color", "linear-gradient(#73c0ff, #005eac)");
                document.documentElement.style.setProperty("--grid-color", "#125c99");
                document.documentElement.style.setProperty("--tile-color", "#3f89c6");
                document.documentElement.style.setProperty("--text-color", "#003159");
            }
            else if (mode_vars[0] == 2) { // Hexagonal Medium
                document.getElementById("2100_difficulty_text").innerHTML = "Hexagonal Medium: rightwards and southeast are X + X, southwest and leftwards are X + 2X, northwest and northeast are 2X + 3X.";
                document.getElementById("2100_difficulty_text").style.setProperty("color", "#7573ff");
                document.getElementById("2100_difficulty_decrease").style.setProperty("display", "block");
                document.getElementById("2100_difficulty_increase").style.setProperty("display", "block");
                displayRules("rules_text", ["h2", "Directional Merges (Hexagonal Medium)"], ["h1", "2160"], ["p","The merge rules are different depending on which direction you're moving. On a rightwards or southeast move, merges occur between two equal tiles. On a southwest or leftwards move, merges occur between an X tile and a 2X tile, for any X. On a northwest or northeast move, merges occur between an 2X tile and a 3X tile, for any X. Get to the 2160 tile to win!"],
                ["p", "Spawning tiles: 1 (100%)"]);
                displayRules("gm_rules_text", ["h2", "Directional Merges (Hexagonal Medium)"], ["h1", "2160"], ["p","The merge rules are different depending on which direction you're moving. On a rightwards or southeast move, merges occur between two equal tiles. On a southwest or leftwards move, merges occur between an X tile and a 2X tile, for any X. On a northwest or northeast move, merges occur between an 2X tile and a 3X tile, for any X. Get to the 2160 tile to win!"],
                ["p", "Spawning tiles: 1 (100%)"]);
                MergeRules = [
                    [2, [["@HDir", ">=", 2], "||", [["@HDir", ">=", 0], "&&", ["@VDir", ">", 0]], "&&", ["@This 0", "=", "@Next 1 0"], "&&", ["@This 1", "=", "@Next 1 1"], "&&", ["@This 2", "=", "@Next 1 2"], "&&", ["@This 3", "=", "@Next 1 3"], "&&", ["@This 4", "=", "@Next 1 4"], "&&", ["@This 5", "=", "@Next 1 5"]], false, [[["@This 0", "+", 1], "@This 1", "@This 2", "@This 3", "@This 4", "@This 5"]], [[2, "^", "@This 0"], "*", [3, "^", "@This 1"], "*", [5, "^", "@This 2"], "*", [7, "^", "@This 3"], "*", [11, "^", "@This 4"], "*", [13, "^", "@This 5"], "*", 2], [false, true]],
                    [2, [["@HDir", "<=", -2], "||", [["@HDir", "<=", 0], "&&", ["@VDir", ">", 0]], "&&", ["@This 0", "+", 1, "=", "@Next 1 0"], "&&", ["@This 1", "=", "@Next 1 1"], "&&", ["@This 2", "=", "@Next 1 2"], "&&", ["@This 3", "=", "@Next 1 3"], "&&", ["@This 4", "=", "@Next 1 4"], "&&", ["@This 5", "=", "@Next 1 5"]], false, [["@This 0", ["@This 1", "+", 1], "@This 2", "@This 3", "@This 4", "@This 5"]], [[2, "^", "@This 0"], "*", [3, "^", "@This 1"], "*", [5, "^", "@This 2"], "*", [7, "^", "@This 3"], "*", [11, "^", "@This 4"], "*", [13, "^", "@This 5"], "*", 3], [false, true]],
                    [2, [["@VDir", "<", 0], "&&", ["@This 0", "-", 1, "=", "@Next 1 0"], "&&", ["@This 1", "+", 1, "=", "@Next 1 1"], "&&", ["@This 2", "=", "@Next 1 2"], "&&", ["@This 3", "=", "@Next 1 3"], "&&", ["@This 4", "=", "@Next 1 4"], "&&", ["@This 5", "=", "@Next 1 5"]], false, [[["@This 0", "-", 1], "@This 1", ["@This 2", "+", 1], "@This 3", "@This 4", "@This 5"]], [[2, "^", "@This 0"], "*", [3, "^", "@This 1"], "*", [5, "^", "@This 2"], "*", [7, "^", "@This 3"], "*", [11, "^", "@This 4"], "*", [13, "^", "@This 5"], "*", 5, "/", 2], [false, true]]
                ];
                winConditions = [[4, 3, 1, 0, 0, 0]];
                document.documentElement.style.setProperty("background-image", "linear-gradient(#c2acff, #004f4f)");
                document.documentElement.style.setProperty("--background-color", "linear-gradient(#926aff, #008383)");
                document.documentElement.style.setProperty("--grid-color", "#218383");
                document.documentElement.style.setProperty("--tile-color", "#977ce1");
                document.documentElement.style.setProperty("--text-color", "#23144e");
            }
            else if (mode_vars[0] == 3) { // Hexagonal Hard
                document.getElementById("2100_difficulty_text").innerHTML = "Hexagonal Hard: rightwards is X + X, southeast is X + 2X, southwest is X + 3X, leftwards is 2X + 3X, northwest is X + 5X, northeast is 2X + 5X.";
                document.getElementById("2100_difficulty_text").style.setProperty("color", "#bc79ff");
                document.getElementById("2100_difficulty_decrease").style.setProperty("opacity", "block");
                document.getElementById("2100_difficulty_increase").style.setProperty("display", "block");
                displayRules("rules_text", ["h2", "Directional Merges (Hexagonal Hard)"], ["h1", "2100"], ["p","The merge rules are different depending on which direction you're moving. On a rightwards move, merges occur between two equal tiles. On a southeast move, merges occur between an X tile and a 2X tile. On a southwest move, merges occur between an X tile and a 3X tile. On a leftwards move, merges occur between a 2X tile and a 3X tile. On a northwest move, merges occur between an X tile and a 5X tile. On a northeast move, merges occur between a 2X tile and a 5X tile. Get to the 2100 tile to win!"],
                ["p", "Spawning tiles: 1 (100%)"]);
                displayRules("gm_rules_text", ["h2", "Directional Merges (Hexagonal Hard)"], ["h1", "2100"], ["p","The merge rules are different depending on which direction you're moving. On a rightwards move, merges occur between two equal tiles. On a southeast move, merges occur between an X tile and a 2X tile. On a southwest move, merges occur between an X tile and a 3X tile. On a leftwards move, merges occur between a 2X tile and a 3X tile. On a northwest move, merges occur between an X tile and a 5X tile. On a northeast move, merges occur between a 2X tile and a 5X tile. Get to the 2100 tile to win!"],
                ["p", "Spawning tiles: 1 (100%)"]);
                MergeRules = [
                    [2, [["@HDir", ">=", 2], "&&", ["@This 0", "=", "@Next 1 0"], "&&", ["@This 1", "=", "@Next 1 1"], "&&", ["@This 2", "=", "@Next 1 2"], "&&", ["@This 3", "=", "@Next 1 3"], "&&", ["@This 4", "=", "@Next 1 4"], "&&", ["@This 5", "=", "@Next 1 5"]], false, [[["@This 0", "+", 1], "@This 1", "@This 2", "@This 3", "@This 4", "@This 5"]], [[2, "^", "@This 0"], "*", [3, "^", "@This 1"], "*", [5, "^", "@This 2"], "*", [7, "^", "@This 3"], "*", [11, "^", "@This 4"], "*", [13, "^", "@This 5"], "*", 2], [false, true]],
                    [2, [[["@HDir", ">=", 0], "&&", ["@VDir", ">", 0]], "&&", ["@This 0", "+", 1, "=", "@Next 1 0"], "&&", ["@This 1", "=", "@Next 1 1"], "&&", ["@This 2", "=", "@Next 1 2"], "&&", ["@This 3", "=", "@Next 1 3"], "&&", ["@This 4", "=", "@Next 1 4"], "&&", ["@This 5", "=", "@Next 1 5"]], false, [["@This 0", ["@This 1", "+", 1], "@This 2", "@This 3", "@This 4", "@This 5"]], [[2, "^", "@This 0"], "*", [3, "^", "@This 1"], "*", [5, "^", "@This 2"], "*", [7, "^", "@This 3"], "*", [11, "^", "@This 4"], "*", [13, "^", "@This 5"], "*", 3], [false, true]],
                    [2, [[["@HDir", "<=", 0], "&&", ["@VDir", ">", 0]], "&&", ["@This 0", "=", "@Next 1 0"], "&&", ["@This 1", "+", 1, "=", "@Next 1 1"], "&&", ["@This 2", "=", "@Next 1 2"], "&&", ["@This 3", "=", "@Next 1 3"], "&&", ["@This 4", "=", "@Next 1 4"], "&&", ["@This 5", "=", "@Next 1 5"]], false, [[["@This 0", "+", 2], "@This 1", "@This 2", "@This 3", "@This 4", "@This 5"]], [[2, "^", "@This 0"], "*", [3, "^", "@This 1"], "*", [5, "^", "@This 2"], "*", [7, "^", "@This 3"], "*", [11, "^", "@This 4"], "*", [13, "^", "@This 5"], "*", 4], [false, true]],
                    [2, [["@HDir", "<=", -2], "&&", ["@This 0", "-", 1, "=", "@Next 1 0"], "&&", ["@This 1", "+", 1, "=", "@Next 1 1"], "&&", ["@This 2", "=", "@Next 1 2"], "&&", ["@This 3", "=", "@Next 1 3"], "&&", ["@This 4", "=", "@Next 1 4"], "&&", ["@This 5", "=", "@Next 1 5"]], false, [[["@This 0", "-", 1], "@This 1", ["@This 2", "+", 1], "@This 3", "@This 4", "@This 5"]], [[2, "^", "@This 0"], "*", [3, "^", "@This 1"], "*", [5, "^", "@This 2"], "*", [7, "^", "@This 3"], "*", [11, "^", "@This 4"], "*", [13, "^", "@This 5"], "*", 5, "/", 2], [false, true]],
                    [2, [[["@HDir", "<=", 0], "&&", ["@VDir", "<", 0]], "&&", ["@This 0", "=", "@Next 1 0"], "&&", ["@This 1", "=", "@Next 1 1"], "&&", ["@This 2", "+", 1, "=", "@Next 1 2"], "&&", ["@This 3", "=", "@Next 1 3"], "&&", ["@This 4", "=", "@Next 1 4"], "&&", ["@This 5", "=", "@Next 1 5"]], false, [[["@This 0", "+", 1], ["@This 1", "+", 1], "@This 2", "@This 3", "@This 4", "@This 5"]], [[2, "^", "@This 0"], "*", [3, "^", "@This 1"], "*", [5, "^", "@This 2"], "*", [7, "^", "@This 3"], "*", [11, "^", "@This 4"], "*", [13, "^", "@This 5"], "*", 6], [false, true]],
                    [2, [[["@HDir", ">=", 0], "&&", ["@VDir", "<", 0]], "&&", ["@This 0", "-", 1, "=", "@Next 1 0"], "&&", ["@This 1", "=", "@Next 1 1"], "&&", ["@This 2", "+", 1, "=", "@Next 1 2"], "&&", ["@This 3", "=", "@Next 1 3"], "&&", ["@This 4", "=", "@Next 1 4"], "&&", ["@This 5", "=", "@Next 1 5"]], false, [[["@This 0", "-", 1], "@This 1", "@This 2", ["@This 3", "+", 1], "@This 4", "@This 5"]], [[2, "^", "@This 0"], "*", [3, "^", "@This 1"], "*", [5, "^", "@This 2"], "*", [7, "^", "@This 3"], "*", [11, "^", "@This 4"], "*", [13, "^", "@This 5"], "*", 7, "/", 2], [false, true]],
                ];
                winConditions = [[2, 1, 2, 1, 0, 0]];
                document.documentElement.style.setProperty("background-image", "linear-gradient(#e6b5ff, #19004d)");
                document.documentElement.style.setProperty("--background-color", "linear-gradient(#db93ff, #200061)");
                document.documentElement.style.setProperty("--grid-color", "#330099");
                document.documentElement.style.setProperty("--tile-color", "#cb63ff");
                document.documentElement.style.setProperty("--text-color", "#2c0d4b");
            }
            else if (mode_vars[0] == 4) { // Hexagonal Very Hard
                document.getElementById("2100_difficulty_text").innerHTML = "Hexagonal Very Hard: rightwards is X + X, southeast is X + 2X, southwest is X + 3X, leftwards is 2X + 3X, northwest is X + 6X, northeast is 5X + 6X.";
                document.getElementById("2100_difficulty_text").style.setProperty("color", "#ff7be9");
                document.getElementById("2100_difficulty_decrease").style.setProperty("opacity", "block");
                document.getElementById("2100_difficulty_increase").style.setProperty("display", "none");
                displayRules("rules_text", ["h2", "Directional Merges (Hexagonal Very Hard)"], ["h1", "2310"], ["p","The merge rules are different depending on which direction you're moving. On a rightwards move, merges occur between two equal tiles. On a southeast move, merges occur between an X tile and a 2X tile. On a southwest move, merges occur between an X tile and a 3X tile. On a leftwards move, merges occur between a 2X tile and a 3X tile. On a northwest move, merges occur between an X tile and a 6X tile. On a northeast move, merges occur between a 5X tile and a 6X tile. Get to the 2310 tile to win!"],
                ["p", "Spawning tiles: 1 (100%)"]);
                displayRules("gm_rules_text", ["h2", "Directional Merges (Hexagonal Very Hard)"], ["h1", "2310"], ["p","The merge rules are different depending on which direction you're moving. On a rightwards move, merges occur between two equal tiles. On a southeast move, merges occur between an X tile and a 2X tile. On a southwest move, merges occur between an X tile and a 3X tile. On a leftwards move, merges occur between a 2X tile and a 3X tile. On a northwest move, merges occur between an X tile and a 6X tile. On a northeast move, merges occur between a 5X tile and a 6X tile. Get to the 2310 tile to win!"],
                ["p", "Spawning tiles: 1 (100%)"]);
                MergeRules = [
                    [2, [["@HDir", ">=", 2], "&&", ["@This 0", "=", "@Next 1 0"], "&&", ["@This 1", "=", "@Next 1 1"], "&&", ["@This 2", "=", "@Next 1 2"], "&&", ["@This 3", "=", "@Next 1 3"], "&&", ["@This 4", "=", "@Next 1 4"], "&&", ["@This 5", "=", "@Next 1 5"]], false, [[["@This 0", "+", 1], "@This 1", "@This 2", "@This 3", "@This 4", "@This 5"]], [[2, "^", "@This 0"], "*", [3, "^", "@This 1"], "*", [5, "^", "@This 2"], "*", [7, "^", "@This 3"], "*", [11, "^", "@This 4"], "*", [13, "^", "@This 5"], "*", 2], [false, true]],
                    [2, [[["@HDir", ">=", 0], "&&", ["@VDir", ">", 0]], "&&", ["@This 0", "+", 1, "=", "@Next 1 0"], "&&", ["@This 1", "=", "@Next 1 1"], "&&", ["@This 2", "=", "@Next 1 2"], "&&", ["@This 3", "=", "@Next 1 3"], "&&", ["@This 4", "=", "@Next 1 4"], "&&", ["@This 5", "=", "@Next 1 5"]], false, [["@This 0", ["@This 1", "+", 1], "@This 2", "@This 3", "@This 4", "@This 5"]], [[2, "^", "@This 0"], "*", [3, "^", "@This 1"], "*", [5, "^", "@This 2"], "*", [7, "^", "@This 3"], "*", [11, "^", "@This 4"], "*", [13, "^", "@This 5"], "*", 3], [false, true]],
                    [2, [[["@HDir", "<=", 0], "&&", ["@VDir", ">", 0]], "&&", ["@This 0", "=", "@Next 1 0"], "&&", ["@This 1", "+", 1, "=", "@Next 1 1"], "&&", ["@This 2", "=", "@Next 1 2"], "&&", ["@This 3", "=", "@Next 1 3"], "&&", ["@This 4", "=", "@Next 1 4"], "&&", ["@This 5", "=", "@Next 1 5"]], false, [[["@This 0", "+", 2], "@This 1", "@This 2", "@This 3", "@This 4", "@This 5"]], [[2, "^", "@This 0"], "*", [3, "^", "@This 1"], "*", [5, "^", "@This 2"], "*", [7, "^", "@This 3"], "*", [11, "^", "@This 4"], "*", [13, "^", "@This 5"], "*", 4], [false, true]],
                    [2, [["@HDir", "<=", -2], "&&", ["@This 0", "-", 1, "=", "@Next 1 0"], "&&", ["@This 1", "+", 1, "=", "@Next 1 1"], "&&", ["@This 2", "=", "@Next 1 2"], "&&", ["@This 3", "=", "@Next 1 3"], "&&", ["@This 4", "=", "@Next 1 4"], "&&", ["@This 5", "=", "@Next 1 5"]], false, [[["@This 0", "-", 1], "@This 1", ["@This 2", "+", 1], "@This 3", "@This 4", "@This 5"]], [[2, "^", "@This 0"], "*", [3, "^", "@This 1"], "*", [5, "^", "@This 2"], "*", [7, "^", "@This 3"], "*", [11, "^", "@This 4"], "*", [13, "^", "@This 5"], "*", 5, "/", 2], [false, true]],
                    [2, [[["@HDir", "<=", 0], "&&", ["@VDir", "<", 0]], "&&", ["@This 0", "+", 1, "=", "@Next 1 0"], "&&", ["@This 1", "+", 1, "=", "@Next 1 1"], "&&", ["@This 2", "=", "@Next 1 2"], "&&", ["@This 3", "=", "@Next 1 3"], "&&", ["@This 4", "=", "@Next 1 4"], "&&", ["@This 5", "=", "@Next 1 5"]], false, [["@This 0", "@This 1", "@This 2", ["@This 3", "+", 1], "@This 4", "@This 5"]], [[2, "^", "@This 0"], "*", [3, "^", "@This 1"], "*", [5, "^", "@This 2"], "*", [7, "^", "@This 3"], "*", [11, "^", "@This 4"], "*", [13, "^", "@This 5"], "*", 6], [false, true]],
                    [2, [[["@HDir", ">=", 0], "&&", ["@VDir", "<", 0]], "&&", ["@This 0", "+", 1, "=", "@Next 1 0"], "&&", ["@This 1", "+", 1, "=", "@Next 1 1"], "&&", ["@This 2", "-", 1, "=", "@Next 1 2"], "&&", ["@This 3", "=", "@Next 1 3"], "&&", ["@This 4", "=", "@Next 1 4"], "&&", ["@This 5", "=", "@Next 1 5"]], false, [["@This 0", "@This 1", ["@This 2", "-", 1], "@This 3", ["@This 4", "+", 1], "@This 5"]], [[2, "^", "@This 0"], "*", [3, "^", "@This 1"], "*", [5, "^", "@This 2"], "*", [7, "^", "@This 3"], "*", [11, "^", "@This 4"], "*", [13, "^", "@This 5"], "*", 11, "/", 5], [false, true]],
                ];
                winConditions = [[1, 1, 1, 1, 1, 0]];
                document.documentElement.style.setProperty("background-image", "linear-gradient(#a2a2ff, #a400a4, #64947c)");
                document.documentElement.style.setProperty("--background-color", "linear-gradient(#ac70ff, #ef00ef, #5bae84)");
                document.documentElement.style.setProperty("--grid-color", "#b927b9");
                document.documentElement.style.setProperty("--tile-color", "#8585ff");
                document.documentElement.style.setProperty("--text-color", "#005028");
            }
        }
    }
}

function displayModifiers(page) {
    if (modifiers[5] == "Custom") { // If the Custom Grid is enabled, page 3 (the grid modifiers) is replaced with pages 3.1 (custom grid) and 3.2 (custom directions)
        if (page < 3) document.getElementById("modifiers_page_counter").innerHTML = "Page " + page + " / " + 6;
        else if (page === 3.1) document.getElementById("modifiers_page_counter").innerHTML = "Page 3 / 6";
        else if (page === 3.2) document.getElementById("modifiers_page_counter").innerHTML = "Page 4 / 6";
        else document.getElementById("modifiers_page_counter").innerHTML = "Page " + (page + 1) + " / " + 6;
    }
    else {
        document.getElementById("modifiers_page_counter").innerHTML = "Page " + page + " / " + "5";
    }
    let pages = [1, 2, 3, 3.1, 3.2, 4, 5];
    for (let p = 0; p < pages.length; p++) {
        if (pages[p] == page) {
            document.getElementById("modifiers_page_" + pages[p]).style.setProperty("display", "block");
        }
        else document.getElementById("modifiers_page_" + pages[p]).style.setProperty("display", "none");
    }
    if (page == 1) {
        if (modifiers[5] == "Custom") document.getElementById("modifiers_slideAmount_title").innerHTML = "Default Maximum Spaces per Move:";
        else document.getElementById("modifiers_slideAmount_title").innerHTML = "Maximum Spaces Moved per Move:";
        if (modifiers[0] == Infinity) document.getElementById("modifiers_slideAmount_counter").innerHTML = "&infin;";
        else document.getElementById("modifiers_slideAmount_counter").innerHTML = modifiers[0];
        if (modifiers[0] == Infinity) document.getElementById("modifiers_slideAmount_minus").style.setProperty("display", "none");
        else document.getElementById("modifiers_slideAmount_minus").style.setProperty("display", "inline-block");
        if (modifiers[0] >= 9999 && modifiers[0] != Infinity) document.getElementById("modifiers_slideAmount_plus").style.setProperty("display", "none");
        else document.getElementById("modifiers_slideAmount_plus").style.setProperty("display", "inline-block");
        document.getElementById("modifiers_randomTileAmount_counter").innerHTML = modifiers[1];
        if (modifiers[1] <= 1) document.getElementById("modifiers_randomTileAmount_minus").style.setProperty("display", "none");
        else document.getElementById("modifiers_randomTileAmount_minus").style.setProperty("display", "inline-block");
        if (modifiers[1] >= 99980001) document.getElementById("modifiers_randomTileAmount_plus").style.setProperty("display", "none");
        else document.getElementById("modifiers_randomTileAmount_plus").style.setProperty("display", "inline-block");
        document.getElementById("modifiers_startTileAmount_counter").innerHTML = modifiers[2];
        if (modifiers[2] <= 1) document.getElementById("modifiers_startTileAmount_minus").style.setProperty("display", "none");
        else document.getElementById("modifiers_startTileAmount_minus").style.setProperty("display", "inline-block");
        if (modifiers[2] >= 99980001) document.getElementById("modifiers_startTileAmount_plus").style.setProperty("display", "none");
        else document.getElementById("modifiers_startTileAmount_plus").style.setProperty("display", "inline-block");
        document.getElementById("modifiers_nextTiles_counter").innerHTML = modifiers[14];
        if (modifiers[14] <= 0) document.getElementById("modifiers_nextTiles_minus").style.setProperty("display", "none");
        else document.getElementById("modifiers_nextTiles_minus").style.setProperty("display", "inline-block");
        if (modifiers[14] >= 9999) document.getElementById("modifiers_nextTiles_plus").style.setProperty("display", "none");
        else document.getElementById("modifiers_nextTiles_plus").style.setProperty("display", "inline-block");
        document.getElementById("modifiers_animationSpeed_change").value = modifiers[16];
        document.getElementById("modifiers_randomVoid_counter").innerHTML = modifiers[17];
        if (modifiers[17] <= 0) document.getElementById("modifiers_randomVoid_minus").style.setProperty("display", "none");
        else document.getElementById("modifiers_randomVoid_minus").style.setProperty("display", "inline-block");
        document.getElementById("modifiers_randomVoid_plus").style.setProperty("display", "inline-block");
        document.getElementById("modifiers_randomBlackBox_counter").innerHTML = modifiers[18];
        if (modifiers[18] <= 0) document.getElementById("modifiers_randomBlackBox_minus").style.setProperty("display", "none");
        else document.getElementById("modifiers_randomBlackBox_minus").style.setProperty("display", "inline-block");
        document.getElementById("modifiers_randomBlackBox_plus").style.setProperty("display", "inline-block");
        document.getElementById("modifiers_spawnInterval_counter").innerHTML = modifiers[19];
        if (modifiers[19] <= 1) document.getElementById("modifiers_spawnInterval_minus").style.setProperty("display", "none");
        else document.getElementById("modifiers_spawnInterval_minus").style.setProperty("display", "inline-block");
        document.getElementById("modifiers_spawnInterval_plus").style.setProperty("display", "inline-block");
    }
    else if (page == 2) {
        if (modifiers[3]) {
            document.getElementById("modifiers_multiMerge_text").innerHTML = "A tile that was just merged can itself be part of another merge on the same move.";
            document.getElementById("modifiers_multiMerge_text").style.setProperty("color", "#c48828");
        }
        else {
            document.getElementById("modifiers_multiMerge_text").innerHTML = "A tile that was just merged cannot itself be part of another merge on the same move.";
            document.getElementById("modifiers_multiMerge_text").style.setProperty("color", "#4e3000");
        }
        if (modifiers[4] == "Edge") {
            document.getElementById("modifiers_spawnLocation_text").innerHTML = "New tiles can only spawn on the edge that you just moved away from.";
            document.getElementById("modifiers_spawnLocation_text").style.setProperty("color", "#c64200");
        }
        else {
            if (modifiers[5] == "4D") document.getElementById("modifiers_spawnLocation_text").innerHTML = "New tiles can spawn in any empty spaces on the grid.<br><br>(Note: This modifier cannot be changed while playing on a 3D/4D grid)";
            else document.getElementById("modifiers_spawnLocation_text").innerHTML = "New tiles can spawn in any empty spaces on the grid.";
            document.getElementById("modifiers_spawnLocation_text").style.setProperty("color", "#c6af00");
        }
        if (modifiers[15] == "Simple") {
            document.getElementById("modifiers_simpleSpawns_text").innerHTML = "Only the first spawnable tile type in each mode can spawn. (In 3072, this gets rid of spawning 3s and bonus tiles, keeping only 1s and 2s in the box. Does not affect 2049, Wildcard 2048, versions of 2216.838 with &#247;2 tiles, 1321, or 1535, 1536, 1537, or any mode that already only spawns one tile)";
            document.getElementById("modifiers_simpleSpawns_text").style.setProperty("color", "#d3c480");
        }
        else if (modifiers[15] == "Equal") {
            document.getElementById("modifiers_simpleSpawns_text").innerHTML = "All tiles that can spawn have equal spawning probability. (Does not affect 3072 or 1535, 1536, 1537, or any mode that already only spawns one tile)";
            document.getElementById("modifiers_simpleSpawns_text").style.setProperty("color", "#fab444");
        }
        else {
            document.getElementById("modifiers_simpleSpawns_text").innerHTML = "Gamemodes have their normal spawning rules.";
            document.getElementById("modifiers_simpleSpawns_text").style.setProperty("color", "#bba43d");
        }
    }
    else if (page == 3) {
        document.getElementById("modifiers_directions_button").style.setProperty("display", "block");
        document.getElementById("modifiers_spawnLocation_button").style.setProperty("display", "block");
        if (modifiers[5] == "Diamond") {
            document.getElementById("modifiers_gridShape_text").innerHTML = "The grid is a diamond, consisting of all tiles that are no more than a certain orthogonal distance away from the center.";
            document.getElementById("modifiers_gridShape_text").style.setProperty("color", "#00a7b7");
        }
        else if (modifiers[5] == "Checkerboard") {
            document.getElementById("modifiers_gridShape_text").innerHTML = "The grid is a checkerboard, i.e. a rectangle with half of the tiles cut out. Diagonals replace orthogonals, and double-size orthogonals replace diagonals.";
            document.getElementById("modifiers_gridShape_text").style.setProperty("color", "#1dae00");
        }
        else if (modifiers[5] == "Hexagon") {
            document.getElementById("modifiers_gridShape_text").innerHTML = "The grid is a hexagon, and despite the tiles still appearing as squares, the game plays as if it's on a hexagonal grid.";
            document.getElementById("modifiers_gridShape_text").style.setProperty("color", "#6f1b8e");
        }
        else if (modifiers[5] == "4D") {
            document.getElementById("modifiers_gridShape_text").innerHTML = "The grid is a 3D or 4D rectangular prism (represented by separated 2D grids), with width, height, length, and depth adjustable separately.";
            document.getElementById("modifiers_gridShape_text").style.setProperty("color", "#5c0900");
            document.getElementById("modifiers_directions_button").style.setProperty("display", "none");
            document.getElementById("modifiers_spawnLocation_button").style.setProperty("display", "none");
        }
        else {
            document.getElementById("modifiers_gridShape_text").innerHTML = "The grid is rectangular, with width and height adjustable separately.";
            document.getElementById("modifiers_gridShape_text").style.setProperty("color", "#8e511b");
        }
        if (modifiers[10] == "Both") {
            if (modifiers[5] == "Checkerboard") document.getElementById("modifiers_directions_text").innerHTML = "You may move in diagonal and double-orthogonal directions. Keyboard controls can use QEZC for the diagonals, WASD or WAXD or the arrow keys for the double-orthogonals.";
            else if (modifiers[5] == "Hexagon") document.getElementById("modifiers_directions_text").innerHTML = "You may move in the six hexagonal directions and the six hexa-diagonal directions. Keyboard controls can use QWASZX for the main six, IOPJKL for the diagonals.";
            else document.getElementById("modifiers_directions_text").innerHTML = "You may move in orthogonal and diagonal directions. Keyboard controls can use WASD or WAXD or the arrow keys for the orthogonals, QEZC for the diagonals.";
            document.getElementById("modifiers_directions_text").style.setProperty("color", "#717100");
        }
        else if (modifiers[10] == "Diagonal") {
            if (modifiers[5] == "Checkerboard") document.getElementById("modifiers_directions_text").innerHTML = "You may only move in double-orthogonal directions. Keyboard controls can use WASD, WAXD, or the arrow keys.";
            else if (modifiers[5] == "Hexagon") document.getElementById("modifiers_directions_text").innerHTML = "You may only move in the six hexa-diagonal directions. Keyboard controls can use IOPJKL.";
            else document.getElementById("modifiers_directions_text").innerHTML = "You may only move in diagonal directions. Keyboard controls can use QEZC.";
            document.getElementById("modifiers_directions_text").style.setProperty("color", "#713c00");
        }
        else {
            if (modifiers[5] == "Checkerboard") document.getElementById("modifiers_directions_text").innerHTML = "You may only move in diagonal directions. Keyboard controls can use QEZC.";
            else if (modifiers[5] == "Hexagon") document.getElementById("modifiers_directions_text").innerHTML = "You may only move in the six hexagonal directions. Keyboard controls can use QWASZX.";
            else if (modifiers[5] == "4D") document.getElementById("modifiers_directions_text").innerHTML = "Depending on the amount of dimensions, you may move in the 2, 4, 6, or 8 orthogonal directions. Keyboard controls can use WASD or the arrow keys to move within the 2D grids, IJKL to move between the 2D grids.<br><br>(Note: You cannot enable diagonal directions with a 3D/4D grid, because I don't want to make 26 or 80 directions of movement yet)"
            else document.getElementById("modifiers_directions_text").innerHTML = "You may only move in orthogonal directions. Keyboard controls can use WASD, WAXD, or the arrow keys.";
            document.getElementById("modifiers_directions_text").style.setProperty("color", "#007104");
        }
        if (modifiers[11]) {
            document.getElementById("modifiers_stayStill_text").innerHTML = "You may choose to not move and just let new tile(s) spawn. (Keyboard controls can use Spacebar to do so)";
            document.getElementById("modifiers_stayStill_text").style.setProperty("color", "#1b8e49");
        }
        else {
            document.getElementById("modifiers_stayStill_text").innerHTML = "You have to move on every turn.";
            document.getElementById("modifiers_stayStill_text").style.setProperty("color", "#798e1b");
        }
    }
    else if (page == 3.1) {
        document.getElementById("modifiers_customGridWidth_counter").innerHTML = width;
        if (width <= 1) document.getElementById("modifiers_customGridWidth_minus").style.setProperty("display", "none");
        else document.getElementById("modifiers_customGridWidth_minus").style.setProperty("display", "inline-block");
        if (width >= 9999) document.getElementById("modifiers_customGridWidth_plus").style.setProperty("display", "none");
        else document.getElementById("modifiers_customGridWidth_plus").style.setProperty("display", "inline-block");
        document.getElementById("modifiers_customGridHeight_counter").innerHTML = height;
        if (height <= 1) document.getElementById("modifiers_customGridHeight_minus").style.setProperty("display", "none");
        else document.getElementById("modifiers_customGridHeight_minus").style.setProperty("display", "inline-block");
        if (height >= 9999) document.getElementById("modifiers_customGridHeight_plus").style.setProperty("display", "none");
        else document.getElementById("modifiers_customGridHeight_plus").style.setProperty("display", "inline-block");
    }
    else if (page == 3.2) {
        createCustomArrows();
        if (screenVars[0] == -1) {
            document.getElementById("modifiers_customArrowOptions").style.setProperty("display", "none");
            document.getElementById("modifiers_customArrow_removeDirection").style.setProperty("display", "none");
            document.getElementById("modifiers_customArrow_addDirection").style.setProperty("display", "block");
        }
        else {
            document.getElementById("modifiers_customArrowOptions").style.setProperty("display", "inline-block");
            document.getElementById("modifiers_customArrow_vdir_counter").innerHTML = directions[screenVars[0]][0][0];
            document.getElementById("modifiers_customArrow_hdir_counter").innerHTML = directions[screenVars[0]][0][1];
            if (directions[screenVars[0]][0][2] == Infinity) document.getElementById("modifiers_customArrow_slideAmount_counter").innerHTML = "&infin;";
            else document.getElementById("modifiers_customArrow_slideAmount_counter").innerHTML = directions[screenVars[0]][0][2];
            if (directions[screenVars[0]][0][0] >= height - 1) document.getElementById("modifiers_customArrow_vdir_plus").style.setProperty("display", "none");
            else document.getElementById("modifiers_customArrow_vdir_plus").style.setProperty("display", "flex");
            if (directions[screenVars[0]][0][0] <= 1 - height) document.getElementById("modifiers_customArrow_vdir_minus").style.setProperty("display", "none");
            else document.getElementById("modifiers_customArrow_vdir_minus").style.setProperty("display", "flex");
            if (directions[screenVars[0]][0][1] >= width - 1) document.getElementById("modifiers_customArrow_hdir_plus").style.setProperty("display", "none");
            else document.getElementById("modifiers_customArrow_hdir_plus").style.setProperty("display", "flex");
            if (directions[screenVars[0]][0][1] <= 1 - width) document.getElementById("modifiers_customArrow_hdir_minus").style.setProperty("display", "none");
            else document.getElementById("modifiers_customArrow_hdir_minus").style.setProperty("display", "flex");
            if (directions[screenVars[0]][0][2] == Infinity) document.getElementById("modifiers_customArrow_slideAmount_minus").style.setProperty("display", "none");
            else document.getElementById("modifiers_customArrow_slideAmount_minus").style.setProperty("display", "flex");
            document.getElementById("modifiers_customArrow_text_change").value = he.decode(directions[screenVars[0]][1]);
            document.getElementById("modifiers_customArrow_width_change").value = directions[screenVars[0]][2] * 100;
            document.getElementById("modifiers_customArrow_height_change").value = directions[screenVars[0]][3] * 100;
            document.getElementById("modifiers_customArrow_fontsize_change").value = directions[screenVars[0]][4] * 100;
            document.getElementById("modifiers_customArrow_vpos_change").value = directions[screenVars[0]][5] * 100;
            document.getElementById("modifiers_customArrow_hpos_change").value = directions[screenVars[0]][6] * 100;
            document.getElementById("modifiers_customArrow_rotation_change").value = directions[screenVars[0]][8];
            if (directions[screenVars[0]][6].length == 0) document.getElementById("modifiers_customArrow_keyText").innerHTML = "Keyboard Keys: (None)";
            else document.getElementById("modifiers_customArrow_keyText").innerHTML = "Keyboard Keys: " + directions[screenVars[0]][7];
            if (inputAvailable) {
                document.getElementById("modifiers_customArrow_addKey").style.setProperty("background-color", "#bfafff");
                document.getElementById("modifiers_customArrow_addKey").innerHTML = "Listening...";
            }
            else {
                document.getElementById("modifiers_customArrow_addKey").style.setProperty("background-color", "#3f2c88");
                document.getElementById("modifiers_customArrow_addKey").innerHTML = "Add New Key";
            }
            document.getElementById("modifiers_customArrow_removeDirection").style.setProperty("display", "block");
            document.getElementById("modifiers_customArrow_addDirection").style.setProperty("display", "none");
        }
    }
    else if (page == 4) {
        if (modifiers[12]) {
            document.getElementById("modifiers_garbage0_text").innerHTML = "Garbage 0s: ON";
            document.getElementById("modifiers_garbage0_text").style.setProperty("color", "#000000");
            document.getElementById("modifiers_garbage0_info").style.setProperty("color", "#000000");
        }
        else {
            document.getElementById("modifiers_garbage0_text").innerHTML = "Garbage 0s: OFF";
            document.getElementById("modifiers_garbage0_text").style.setProperty("color", "#808080");
            document.getElementById("modifiers_garbage0_info").style.setProperty("color", "#808080");
        }
        if (modifiers[13] == "None") {
            document.getElementById("modifiers_negativetiles_text").innerHTML = "Negative Tiles: OFF";
            document.getElementById("modifiers_negativetiles_text").style.setProperty("color", "#a81100");
            document.getElementById("modifiers_negativetiles_info").style.setProperty("color", "#a81100");
        }
        else if (modifiers[13] == "Interacting") {
            document.getElementById("modifiers_negativetiles_text").innerHTML = "Negative Tiles: ON, Interacting";
            document.getElementById("modifiers_negativetiles_text").style.setProperty("color", "#8c00a8");
            document.getElementById("modifiers_negativetiles_info").style.setProperty("color", "#8c00a8");
        }
        else {
            document.getElementById("modifiers_negativetiles_text").innerHTML = "Negative Tiles: ON, Non-Interacting";
            document.getElementById("modifiers_negativetiles_text").style.setProperty("color", "#0000a8");
            document.getElementById("modifiers_negativetiles_info").style.setProperty("color", "#0000a8");
        }
    }
    else if (page == 5) {
        if (modifiers[20]) {
            document.getElementById("modifiers_twoMoveMerge_text").innerHTML = "To merge tiles, you must move in the same direction twice in a row.";
            document.getElementById("modifiers_twoMoveMerge_text").style.setProperty("color", "#7f0099");
        }
        else {
            document.getElementById("modifiers_twoMoveMerge_text").innerHTML = "Merges can occur on any move.";
            document.getElementById("modifiers_twoMoveMerge_text").style.setProperty("color", "#ff56ff");
        }
        if (auto_directions.length == 0) {
            document.getElementById("modifiers_emptyAutoMoves_text").style.setProperty("display", "block");
            document.getElementById("modifiers_emptyAutoMoves_button").style.setProperty("display", "block");
            document.getElementById("modifiers_AutoMovesBox").style.setProperty("display", "none");
        }
        else {
            document.getElementById("modifiers_emptyAutoMoves_text").style.setProperty("display", "none");
            document.getElementById("modifiers_emptyAutoMoves_button").style.setProperty("display", "none");
            document.getElementById("modifiers_AutoMovesBox").style.setProperty("display", "flex");
            document.getElementById("modifiers_AutoMoves_counter").innerHTML = "Automatic Move " + (screenVars[0] + 1) + " / " + auto_directions.length;
            document.getElementById("modifiers_AutoMoves_vdir_counter").innerHTML = auto_directions[screenVars[0]][0][0];
            document.getElementById("modifiers_AutoMoves_hdir_counter").innerHTML = auto_directions[screenVars[0]][0][1];
            if (auto_directions[screenVars[0]][0][2] == Infinity) document.getElementById("modifiers_AutoMoves_slideAmount_counter").innerHTML = "&infin;";
            else document.getElementById("modifiers_AutoMoves_slideAmount_counter").innerHTML = auto_directions[screenVars[0]][0][2];
            if (auto_directions[screenVars[0]][2][0] == Infinity) document.getElementById("modifiers_AutoMoves_frequency_counter").innerHTML = "&infin;";
            else document.getElementById("modifiers_AutoMoves_frequency_counter").innerHTML = auto_directions[screenVars[0]][2][0];
            document.getElementById("modifiers_AutoMoves_firstTurn_counter").innerHTML = auto_directions[screenVars[0]][2][1];
            if (auto_directions.length > 1) {
                document.getElementById("modifiers_AutoMoves_previous").style.setProperty("display", "inline-block");
                document.getElementById("modifiers_AutoMoves_next").style.setProperty("display", "inline-block");
            }
            else {
                document.getElementById("modifiers_AutoMoves_previous").style.setProperty("display", "none");
                document.getElementById("modifiers_AutoMoves_next").style.setProperty("display", "none");
            }
            if (auto_directions[screenVars[0]][0][0] <= 1 - height) document.getElementById("modifiers_AutoMoves_vdir_minus").style.setProperty("display", "none");
            else document.getElementById("modifiers_AutoMoves_vdir_minus").style.setProperty("display", "flex");
            if (auto_directions[screenVars[0]][0][0] >= height - 1) document.getElementById("modifiers_AutoMoves_vdir_plus").style.setProperty("display", "none");
            else document.getElementById("modifiers_AutoMoves_vdir_plus").style.setProperty("display", "flex");
            if (auto_directions[screenVars[0]][0][1] <= 1 - width) document.getElementById("modifiers_AutoMoves_hdir_minus").style.setProperty("display", "none");
            else document.getElementById("modifiers_AutoMoves_hdir_minus").style.setProperty("display", "flex");
            if (auto_directions[screenVars[0]][0][1] >= width - 1) document.getElementById("modifiers_AutoMoves_hdir_plus").style.setProperty("display", "none");
            else document.getElementById("modifiers_AutoMoves_hdir_plus").style.setProperty("display", "flex");
            if (auto_directions[screenVars[0]][0][2] == Infinity) document.getElementById("modifiers_AutoMoves_slideAmount_minus").style.setProperty("display", "none");
            else document.getElementById("modifiers_AutoMoves_slideAmount_minus").style.setProperty("display", "flex");
            if (auto_directions[screenVars[0]][2][0] == Infinity) document.getElementById("modifiers_AutoMoves_frequency_minus").style.setProperty("display", "none");
            else document.getElementById("modifiers_AutoMoves_frequency_minus").style.setProperty("display", "flex");
            if (auto_directions[screenVars[0]][2][1] == 0) document.getElementById("modifiers_AutoMoves_firstTurn_minus").style.setProperty("display", "none");
            else document.getElementById("modifiers_AutoMoves_firstTurn_minus").style.setProperty("display", "flex");
            if (auto_directions[screenVars[0]][0][4][0] == 0) {
                document.getElementById("modifiers_AutoMoves_manualStrength_text").innerHTML = "This automatic move counts as its own separate move."
                document.getElementById("modifiers_AutoMoves_manualStrength_text").style.setProperty("color", "#fc0058");
            }
            else {
                document.getElementById("modifiers_AutoMoves_manualStrength_text").innerHTML = "This automatic move counts as part of the manual move that it triggers during."
                document.getElementById("modifiers_AutoMoves_manualStrength_text").style.setProperty("color", "#8600fc");
            }
            if (auto_directions[screenVars[0]][0][4][1]) {
                document.getElementById("modifiers_AutoMoves_merges_text").innerHTML = "Tiles can be merged during this move."
                document.getElementById("modifiers_AutoMoves_merges_text").style.setProperty("color", "#a8d82c");
            }
            else {
                document.getElementById("modifiers_AutoMoves_merges_text").innerHTML = "Tiles can not be merged during this move."
                document.getElementById("modifiers_AutoMoves_merges_text").style.setProperty("color", "#638019");
            }
            if (auto_directions[screenVars[0]][1] == "Between") {
                document.getElementById("modifiers_AutoMoves_timing_text").innerHTML = "This automatic move occurs after the manual move finishes, but before new tiles spawn."
                document.getElementById("modifiers_AutoMoves_timing_text").style.setProperty("color", "#00bd5f");
            }
            else if (auto_directions[screenVars[0]][1] == "Before") {
                document.getElementById("modifiers_AutoMoves_timing_text").innerHTML = "This automatic move occurs before the manual move begins."
                document.getElementById("modifiers_AutoMoves_timing_text").style.setProperty("color", "#3f9cff");
            }
            else if (auto_directions[screenVars[0]][1] == "After") {
                document.getElementById("modifiers_AutoMoves_timing_text").innerHTML = "This automatic move occurs after the manual move finishes and new tiles have spawned."
                document.getElementById("modifiers_AutoMoves_timing_text").style.setProperty("color", "#7d000a");
            }
        }
    }
}

//Beginning the game and showing the grid
function startGame() {
    inputAvailable = false;
    switchScreen("Gameplay", "Main");
    for (let d = 0; d < directionsAvailable.length; d++) directionsAvailable[d] = true;
    possibleOverChecked = false;
    score = 0;
    won = 0;
    moves_so_far = 0;
    merges_so_far = 0;
    moves_where_merged = 0;
    merges_before_now = 0;
    discoveredTiles = [];
    discoveredWinning = [];
    discoveredLosing = [];

    Grid = [];
    tsize = 0;
    GridTiles = [];
    visibleNextTiles = [];
    if (gamemode != 0) nextTiles = modifiers[14]; //This isn't part of loadModifiers because it needs to happen before createGrid
    createGrid((gamemode != 0));
    Grid = structuredClone(startingGrid);
    loadModifiers();
    loadResettingModifiers();
    createArrows();
    createStatBoxes();
    let exrule = 0;
    while (exrule < MergeRules.length) { //This script expands the multi-length merge rules into several single-length merge rules
        let exm = structuredClone(MergeRules[exrule]);
        let vars = [];
        if (exm[0] === "@var_retain" || exm[0] == "@var_copy") {
            vars.push(exm[0]);
            exm.shift();
        }
        if (exm[0] === "@include_gvars") {
            vars.push(exm[0]);
            exm.shift();
        }
        if (exm.indexOf("@end_vars") > -1) {
            let newvars = exm.slice(0, exm.indexOf("@end_vars"));
            vars = vars.concat(newvars);
            exm.splice(0, exm.indexOf("@end_vars") + 1);
        }
        if (exm[0] == 0) break;
        if (exm.length > 9 && exm[9] > exm[0]) {
            let arbrule = exm;
            let length = exm[6];
            let maxlength = exm[9];
            let iterations = 0;
            while (length <= maxlength) {
                let crule = structuredClone(arbrule);
                crule[0] = length;
                crule[9] = length;
                crule = evaluateMergeRule(crule);
                if (length >= exm[0]) {
                    iterations++;
                    if (vars.length > 0) MergeRules.splice(exrule + 1, 0, vars.concat("@end_vars", crule));
                    else MergeRules.splice(exrule + 1, 0, crule);
                }
                length += crule[8];
            }
            MergeRules.splice(exrule, 1);
            exrule += iterations;
        }
        else exrule++;
    }
    TileSpawns = structuredClone(startTileSpawns);
    game_vars = structuredClone(start_game_vars);
    modifier_vars = structuredClone(start_modifier_vars);
    SpawnBoxes = [];
    for (let i = 0; i < TileSpawns.length; i++) {
        SpawnBoxes.push([]);
        if (TileSpawns[i][0] == "Box") refillSpawnBox(i);
    }
    spawnConveyor = [];
    for (let i = 0; i < Math.max(nextTiles, 1); i++) spawnConveyor.push("@Empty");
    refillSpawnConveyor();
    forcedSpawnTiles("BeforeSpawns", 0, 0);
    RandomTiles(startTileAmount, 0, 0);
    forcedSpawnTiles("AfterSpawns", 0, 0);
    displayButtons(true);
    inputAvailable = true;
}

function createGrid() {
    let makeStart = true; //Normally, createGrid creates the starting grid, but if this is false, the starting grid is preserved and createGrid just makes the HTML tiles
    if (arguments.length > 0) makeStart = arguments[0];
    while (document.getElementById("grid").lastElementChild) document.getElementById("grid").removeChild(document.getElementById("grid").lastElementChild);
    while (document.getElementById("next_tiles").lastElementChild) document.getElementById("next_tiles").removeChild(document.getElementById("next_tiles").lastElementChild);
    if (modifiers[5] == "Diamond") {
        width = modifiers[6] * 2 + 1;
        height = modifiers[6] * 2 + 1;
    }
    else if (modifiers[5] == "Hexagon") {
        width = modifiers[6] * 4 + 1;
        height = modifiers[6] * 2 + 1;
    }
    else if (modifiers[5] == "4D") {
        width = modifiers[6] * modifiers[8] + modifiers[8] - 1;
        height = modifiers[7] * modifiers[9] + modifiers[9] - 1;
    }
    let BlackBox = ["BlackBox"]; // From the "Randomly-Placed Box Tiles" modifier
    for (let i = 1; i < TileNumAmount; i++) BlackBox.push(0);
    document.documentElement.style.setProperty("--width", width);
    document.documentElement.style.setProperty("--height", height);
    tsize = 100 * Math.min(1, width/height)/width;
    document.documentElement.style.setProperty("--tile_size", tsize * 0.9 + "%");
    document.documentElement.style.setProperty("--th_dist", tsize * (1 - 0.1 * 1/(width + 1)) * Math.max(1, height/width));
    document.documentElement.style.setProperty("--tv_dist", tsize * (1 - 0.1 * 1/(height + 1)) * Math.max(1, width/height));
    if (makeStart && modifiers[5] != "Custom") startingGrid = [];
    for (let row = 0; row < height; row++) {
        if (makeStart && modifiers[5] != "Custom") startingGrid.push([]);
        for (let column = 0; column < width; column++) {
            if (makeStart && modifiers[5] != "Custom") {
                if (modifiers[5] == "Diamond" && ((Math.abs(row - modifiers[6]) + Math.abs(column - modifiers[6])) > modifiers[6])) startingGrid[row].push("@Void");
                else if (modifiers[5] == "Checkerboard" && (row + column) % 2 == 1) startingGrid[row].push("@Void");
                else if (modifiers[5] == "Hexagon" && ((Math.abs(row - modifiers[6]) + Math.abs(column - modifiers[6] * 2)) % 2 == 1 || (Math.abs(row - modifiers[6]) + Math.abs(column - modifiers[6] * 2)) > modifiers[6] * 2)) startingGrid[row].push("@Void");
                else if (modifiers[5] == "4D" && ((row + 1) % (modifiers[7] + 1) == 0 || (column + 1) % (modifiers[6] + 1) == 0)) startingGrid[row].push("@Void");
                else startingGrid[row].push("@Empty");
            }
            if (modifiers[5] == "Custom" && startingGrid[row][column] == "@BlackBox") {
                startingGrid[row][column] = BlackBox;
            }
            let newEmpty = document.createElement("div");
            newEmpty.id = "Empty_" + row + "_" + column;
            newEmpty.classList.add("empty_tile");
            document.getElementById("grid").appendChild(newEmpty);
        }
    }
    GridTiles = document.getElementById("grid").children; //An HTML collection of the empty tiles
    let Positions = [];
    for (let row = 0; row < height; row++) {
        Positions.push([]);
        for (let column = 0; column < width; column++) {
            Positions[row].push([]);
        }
    }
    for (let t of GridTiles) {
        let char = 6;
        let hcoord = "";
        let vcoord = "";
        while (t.id[char] != "_") {vcoord += t.id[char]; char++;}
        char++;
        while (char < t.id.length) {hcoord += t.id[char]; char++;}
        hcoord = Number(hcoord);
        vcoord = Number(vcoord);
        let hsize = Number(getComputedStyle(document.documentElement).getPropertyValue("--th_dist"));
        let vsize = Number(getComputedStyle(document.documentElement).getPropertyValue("--tv_dist"));
        t.style.setProperty("left", hsize * (0.075 + hcoord) + "%");
        t.style.setProperty("top", vsize * (0.075 + vcoord) + "%");
        Positions[vcoord][hcoord] = [hsize * (0.075 + hcoord), vsize * (0.075 + vcoord)];
        let newTile = document.createElement("div");
        newTile.id = "Tile_" + vcoord + "_" + hcoord;
        newTile.classList.add("tile");
        t.appendChild(newTile);
        let newTilep = document.createElement("p");
        let newTilet = document.createTextNode("");
        newTilep.appendChild(newTilet);
        t.firstElementChild.appendChild(newTilep);
    }
    if (nextTiles == 0) document.getElementById("next_tiles_container").style.setProperty("display", "none");
    else {
        document.getElementById("next_tiles_container").style.setProperty("display", "inline-block");
        for (let nx = 0; nx < nextTiles; nx++) {
            let newNext = document.createElement("div");
            newNext.id = "nextTile_" + nx;
            newNext.classList.add("next_tile");
            document.getElementById("next_tiles").appendChild(newNext);
            let newTilep = document.createElement("p");
            let newTilet = document.createTextNode("");
            newTilep.appendChild(newTilet);
            newNext.appendChild(newTilep);
        }
    }
    visibleNextTiles = document.getElementById("next_tiles").children;
}

function createArrows() {
    while (document.getElementById("arrow-container").children.length > 0) document.getElementById("arrow-container").removeChild(document.getElementById("arrow-container").lastElementChild);
    directionsAvailable = [];
    for (let d = 0; d < directions.length; d++) {
        directionsAvailable.push(true);
        let newArrow = document.createElement("div");
        newArrow.id = "Arrow_" + d;
        newArrow.classList.add("arrow");
        newArrow.classList.add("button");
        newArrow.classList.add("hover_grow");
        document.getElementById("arrow-container").appendChild(newArrow);
        let newArrowp = document.createElement("p");
        newArrow.appendChild(newArrowp);
        newArrowp.innerHTML = directions[d][1];
        newArrow.style.setProperty("width", directions[d][2] * 100 + "%");
        newArrow.style.setProperty("height", directions[d][3] * 100 + "%");
        newArrow.style.setProperty("border-width", "calc(0.04vw * var(--grid_vw) *" + Math.min(directions[d][2], directions[d][3]) + ")");
        newArrow.style.setProperty("font-size", "calc(1vw * var(--grid_vw) *" + directions[d][4] + ")");
        newArrow.style.setProperty("top", directions[d][5] * 100 + "%");
        newArrow.style.setProperty("left", directions[d][6] * 100 + "%");
        if (directions[d].length > 8) newArrowp.style.setProperty("rotate", directions[d][8] + "deg");
        newArrow.addEventListener("click",  function(){
            if (!inputAvailable || currentScreen != "Gameplay") return;
            if (directionsAvailable[d]) MoveHandler(d);
        }
        )
    }
}

function createStatBoxes() {
    while (document.getElementById("score_line").children.length > 0) document.getElementById("score_line").removeChild(document.getElementById("score_line").lastElementChild);
    for (let b = 0; b < statBoxes.length; b++) {
        let newBox = document.createElement("div");
        newBox.id = "stat_container_" + b;
        newBox.classList.add("stat_container");
        document.getElementById("score_line").appendChild(newBox);
        let title = document.createElement("p");
        title.id = "stat_title_" + b;
        title.classList.add("stat_title");   
        if (statBoxes[b][0].length < 8) title.style.setProperty("font-size", "100%");
        else title.style.setProperty("font-size", "calc(75% *" + Math.min(1, Math.sqrt(20/statBoxes[b][0].length)) + ")");
        title.innerHTML = statBoxes[b][0];
        newBox.appendChild(title);
        let counter = document.createElement("p");
        counter.id = "stat_counter_" + b;
        counter.classList.add("stat_counter");
        counter.innerHTML = "0";
        newBox.appendChild(counter);
    }
}

function defaultAbbreviate(n) { // Tiles whose text values are of type number (which is currently all of them except Garbage 0s and Box Tiles) use this
    if (typeof n == "number") {
        if (Math.abs(n) < 10000 && Math.abs(n) >= 0.1) return abbreviateNumber(n, "Number", 3, false);
        else if (Math.abs(n) >= 10000 && Math.abs(n) < 1e12) return abbreviateNumber(n, "Number", 3, true);
        else return abbreviateNumber(n, "Scientific", 5, true);
    }
    else if (typeof n == "bigint") {
        if (abs(n) < 10000) return String(n);
        else return abbreviateNumber(n, "BigInt", 0, true);
    }
    else return n;
}

function displayGrid() {
    for (let t of GridTiles) { //Displaying the tiles on the grid
        let char = 6;
        let hcoord = "";
        let vcoord = "";
        while (t.id[char] != "_") {vcoord += t.id[char]; char++;}
        char++;
        while (char < t.id.length) {hcoord += t.id[char]; char++;}
        hcoord = Number(hcoord);
        vcoord = Number(vcoord);
        let tile = t.firstElementChild;
        if (Grid[vcoord][hcoord] == "@Void") tile.parentElement.style.setProperty("display", "none");
        else tile.parentElement.style.setProperty("display", "inline-block");
        if (Grid[vcoord][hcoord] == "@Empty" || Grid[vcoord][hcoord] == "@Void") {tile.style.setProperty("display", "none");}
        else {
            tile.style.setProperty("display", "flex"); //Flex display is so the number of the tile can be centered on the tile
            tile.style.setProperty("left", "0%");
            tile.style.setProperty("top", "0%");
            let displaynum = 0;
            let displayfound = false;
            let display = [];
            let vars = [];
            while (!displayfound && displaynum < TileTypes.length) {
                display = structuredClone(TileTypes[displaynum]);
                if (display[0] === "@include_gvars") {
                    let newvars = structuredClone(game_vars);
                    for (let v = 0; v < newvars.length; v++) {
                        newvars[v] = CalcArrayConvert(newvars[v], "=", vcoord, hcoord, 0, 0, [1, Infinity], Grid, [], vars);
                        if (Array.isArray(newvars[v])) newvars[v].unshift("@Literal");
                        vars.push(newvars[v]);
                    }
                    display.shift();
                }
                if (display.indexOf("@end_vars") > -1) {
                    let newvars = display.slice(0, display.indexOf("@end_vars"));
                    for (let v = 0; v < newvars.length; v++) {
                        newvars[v] = CalcArrayConvert(newvars[v], "=", vcoord, hcoord, 0, 0, [1, Infinity], Grid, [], vars);
                        if (Array.isArray(newvars[v])) newvars[v].unshift("@Literal");
                        vars.push(newvars[v]);
                    }
                    display.splice(0, display.indexOf("@end_vars") + 1);
                }
                if (eqPrimArrays(display[0], Grid[vcoord][hcoord]) || (CalcArray(display[0], vcoord, hcoord, 0, 0, [1, Infinity, 0], Grid, [], vars) === true)) displayfound = true;
                else displaynum++;
            }
            if (displaynum >= TileTypes.length) {displaynum = TileTypes.length - 1;}
            tile.firstElementChild.innerHTML = defaultAbbreviate(CalcArray(display[1], vcoord, hcoord, 0, 0, [1, Infinity, 0], Grid, [], vars));
            let fontmin = 2;
            let fontmax = tile.firstElementChild.textContent.length * 0.7;
            //Normally, the font size on a tile is dependent on the size of the text, but if the TileTypes entry has more than four entries, the 4th and 5th entries place restrictions on the font size
            if (display.length > 5) {
                if (display[5] > 0) fontmin = display[5];
                else if (display[5] < 0) fontmin = tile.firstElementChild.textContent.length * display[5];
            }
            if (display.length > 6) {
                if (display[6] > 0) fontmax = display[5];
                else if (display[6] < 0) fontmax = tile.firstElementChild.textContent.length * display[6];
            }
            tile.style.setProperty("font-size", "calc(1vw * var(--grid_vw) * " + (tsize / 100 / Math.max(fontmin, fontmax)) + ")");
            let dispbackground = evaluateColor(display[2], vcoord, hcoord, Grid, vars);
            if (dispbackground.includes("gradient")) {
                tile.style.setProperty("background-image", (evaluateColor(display[2], vcoord, hcoord, Grid, vars)));
            }
            else {
                tile.style.setProperty("background-color", (evaluateColor(display[2], vcoord, hcoord, Grid, vars)));
                tile.style.setProperty("background-image", "none");
            }
            tile.style.setProperty("color", (evaluateColor(display[3], vcoord, hcoord, Grid, vars)));
            tile.style.setProperty("text-shadow", "none");
            if (display.length > 4) {
                if (typeof display[4] == "string") tile.style.setProperty("text-shadow", display[4]);
                else if (Array.isArray(display[4]) && display[4].length > 3) {
                    let offset1 = "calc(1vw * var(--grid_vw) * " + (tsize / 100 / Math.max(fontmin, fontmax) * display[4][0]) + ") ";
                    let offset2 = "calc(1vw * var(--grid_vw) * " + (tsize / 100 / Math.max(fontmin, fontmax) * display[4][1]) + ") ";
                    let blur = "calc(1vw * var(--grid_vw) * " + (tsize / 100 / Math.max(fontmin, fontmax) * display[4][2]) + ") ";
                    let color = evaluateColor(display[4][3], vcoord, hcoord, Grid, vars);
                    let shadow = offset1 + offset2 + blur + color;
                    tile.style.setProperty("text-shadow", shadow);
                }
            }
            while (tile.children.length > 1) tile.removeChild(tile.lastElementChild);
            let dispelem = 7;
            while (dispelem < display.length) { //If a TileTypes entry has more than six entries, all entries after the 5th relate to additional pieces of text on the tile, such as how Isotopic 256 displays the radioactivity counters
                if (display[dispelem][0] == "Innerscript") {
                    let innerdisplay = display[dispelem].slice(1);
                    let innerscript = document.createElement("p");
                    let innertext = document.createElement("span");
                    innerscript.appendChild(innertext);
                    tile.appendChild(innerscript);
                    innerscript.style.setProperty("position", "absolute");
                    let vert = (innerdisplay[1].split("-"))[0];
                    let horiz = (innerdisplay[1].split("-"))[1];
                    innerscript.style.setProperty("display", "flex");
                    innerscript.style.setProperty("width", "100%");
                    innerscript.style.setProperty("height", "100%");
                    if (vert == "top") {
                        innerscript.style.setProperty("align-items", "flex-start");
                    }
                    if (vert == "bottom") {
                        innerscript.style.setProperty("align-items", "flex-end");
                    }
                    else {
                        innerscript.style.setProperty("align-items", "center");
                    }
                    if (horiz == "left") {
                        innerscript.style.setProperty("justify-content", "flex-start");
                    }
                    if (horiz == "right") {
                        innerscript.style.setProperty("justify-content", "flex-end");
                    }
                    else {
                        innerscript.style.setProperty("justify-content", "center");
                    }
                    innertext.innerHTML = defaultAbbreviate(CalcArray(innerdisplay[0], vcoord, hcoord, 0, 0, [1, Infinity, 0], Grid, [], vars));
                    let fontmin = 2;
                    let fontmax = innerscript.textContent.length * 0.7;
                    if (innerdisplay.length > 2) {
                        if (innerdisplay[2] > 0) fontmin = innerdisplay[2];
                        else if (innerdisplay[2] < 0) fontmin = innerscript.textContent.length * innerdisplay[2];
                    }
                    if (innerdisplay.length > 3) {
                        if (innerdisplay[3] > 0) fontmax = innerdisplay[3];
                        else if (innerdisplay[3] < 0) fontmax = innerscript.textContent.length * innerdisplay[3];
                    }
                    innerscript.style.setProperty("font-size", "calc(1vw * var(--grid_vw) * " + (tsize / 100 / Math.max(fontmin, fontmax)) + ")");
                    if (innerdisplay.length > 4) innerscript.style.setProperty("color", (evaluateColor(innerdisplay[4], vcoord, hcoord, Grid, vars)));
                    if (innerdisplay.length > 5) {
                        if (typeof innerdisplay[5] == "string") innerscript.style.setProperty("text-shadow", innerdisplay[5]);
                        else if (Array.isArray(innerdisplay[5]) && innerdisplay[5].length > 3) {
                            let offset1 = "calc(1vw * var(--grid_vw) * " + (tsize / 100 / Math.max(fontmin, fontmax) * innerdisplay[5][0]) + ") ";
                            let offset2 = "calc(1vw * var(--grid_vw) * " + (tsize / 100 / Math.max(fontmin, fontmax) * innerdisplay[5][1]) + ") ";
                            let blur = "calc(1vw * var(--grid_vw) * " + (tsize / 100 / Math.max(fontmin, fontmax) * innerdisplay[5][2]) + ") ";
                            let color = evaluateColor(innerdisplay[5][3], vcoord, hcoord, Grid, vars);
                            let shadow = offset1 + offset2 + blur + color;
                            innerscript.style.setProperty("text-shadow", shadow);
                        }
                    }
                    dispelem++;
                }
            }
        }
    }
    for (let t of visibleNextTiles) {  //Displaying the next spawning tiles
        let char = 9;
        let nextnum = "";
        while (char < t.id.length) {nextnum += t.id[char]; char++;}
        nextnum = Number(nextnum);
        let tile = t;
        if (nextTiles[nextnum] == "@Empty") {tile.style.setProperty("display", "none");}
        else {
            tile.style.setProperty("display", "flex");
            let displaynum = 0;
            let displayfound = false;
            let display = [];
            let vars = [];
            while (!displayfound && displaynum < TileTypes.length) {
                display = structuredClone(TileTypes[displaynum]);
                if (display[0] === "@include_gvars") {
                    let newvars = structuredClone(game_vars);
                    for (let v = 0; v < newvars.length; v++) {
                        newvars[v] = CalcArrayConvert(newvars[v], "=", vcoord, hcoord, 0, 0, [1, Infinity, 0], Grid, [], vars);
                        if (Array.isArray(newvars[v])) newvars[v].unshift("@Literal");
                        vars.push(newvars[v]);
                    }
                    display.shift();
                }
                if (display.indexOf("@end_vars") > -1) {
                    let newvars = display.slice(0, display.indexOf("@end_vars"));
                    for (let v = 0; v < newvars.length; v++) {
                        newvars[v] = CalcArrayConvert(newvars[v], "=", vcoord, hcoord, 0, 0, [1, Infinity, 0], Grid, [], vars);
                        if (Array.isArray(newvars[v])) newvars[v].unshift("@Literal");
                        vars.push(newvars[v]);
                    }
                    display.splice(0, display.indexOf("@end_vars") + 1);
                }
                if (eqPrimArrays(display[0], spawnConveyor[nextnum]) || (CalcArray(display[0], nextnum, "None", 0, 0, [1, Infinity, 0], spawnConveyor, [], vars) === true)) displayfound = true;
                else displaynum++;
            }
            if (displaynum >= TileTypes.length) {displaynum = TileTypes.length - 1;}
            tile.firstElementChild.innerHTML = defaultAbbreviate(CalcArray(display[1], nextnum, "None", 0, 0, [1, Infinity, 0], spawnConveyor, [], vars));
            let fontmin = 2;
            let fontmax = tile.firstElementChild.textContent.length * 0.7;
            if (display.length > 5) {
                if (display[5] > 0) fontmin = display[5];
                else if (display[5] < 0) fontmin = tile.firstElementChild.textContent.length * display[5];
            }
            if (display.length > 6) {
                if (display[6] > 0) fontmax = display[6];
                else if (display[6] < 0) fontmax = tile.firstElementChild.textContent.length * display[6];
            }
            tile.style.setProperty("font-size", "calc(1vw * var(--grid_vw) * " + (4/33 / Math.max(fontmin, fontmax)) + ")");
            let dispbackground = evaluateColor(display[2], nextnum, "None", spawnConveyor);
            if (dispbackground.includes("gradient")) {
                tile.style.setProperty("background-image", (evaluateColor(display[2], nextnum, "None", spawnConveyor, vars)));
            }
            else {
                tile.style.setProperty("background-color", (evaluateColor(display[2], nextnum, "None", spawnConveyor, vars)));
                tile.style.setProperty("background-image", "none");
            }
            tile.style.setProperty("color", (evaluateColor(display[3], nextnum, "None", spawnConveyor, vars)));
            tile.style.setProperty("text-shadow", "none");
            if (display.length > 4) {
                if (typeof display[4] == "string") tile.style.setProperty("text-shadow", display[4]);
                else if (Array.isArray(display[4]) && display[4].length > 3) {
                    let offset1 = "calc(1vw * var(--grid_vw) * " + (4/33 / Math.max(fontmin, fontmax) * display[4][0]) + ") ";
                    let offset2 = "calc(1vw * var(--grid_vw) * " + (4/33 / Math.max(fontmin, fontmax) * display[4][1]) + ") ";
                    let blur = "calc(1vw * var(--grid_vw) * " + (4/33 / Math.max(fontmin, fontmax) * display[4][2]) + ") ";
                    let color = evaluateColor(display[4][3], nextnum, "None", spawnConveyor, vars);
                    let shadow = offset1 + offset2 + blur + color;
                    tile.style.setProperty("text-shadow", shadow);
                }
            }
            while (tile.children.length > 1) tile.removeChild(tile.lastElementChild);
            let dispelem = 7;
            while (dispelem < display.length) {
                if (display[dispelem][0] == "Innerscript") {
                    let innerdisplay = display[dispelem];
                    let innerscript = document.createElement("p");
                    let innertext = document.createElement("span");
                    innerscript.appendChild(innertext);
                    tile.appendChild(innerscript);
                    innerscript.style.setProperty("position", "absolute");
                    let vert = (innerdisplay[1].split("-"))[0];
                    let horiz = (innerdisplay[1].split("-"))[1];
                    if (vert == "top") {
                        innerscript.style.setProperty("top", "0px");
                    }
                    else innerscript.style.setProperty("bottom", "0px");
                    innerscript.style.setProperty("text-align", horiz);
                    innertext.innerHTML = defaultAbbreviate(CalcArray(innerdisplay[0], nextnum, "None", 0, 0, [1, Infinity, 0], spawnConveyor, [], vars));
                    let fontmin = 2;
                    let fontmax = innerscript.textContent.length * 0.7;
                    if (innerdisplay.length > 2) {
                        if (innerdisplay[2] > 0) fontmin = display[4];
                        else if (innerdisplay[2] < 0) fontmin = innerscript.textContent.length * display[4];
                    }
                    if (innerdisplay.length > 3) {
                        if (innerdisplay[3] > 0) fontmax = display[5];
                        else if (innerdisplay[3] < 0) fontmax = innerscript.textContent.length * display[5];
                    }
                    innerscript.style.setProperty("font-size", "calc(1vw * var(--grid_vw) * " + (4/33 / Math.max(fontmin, fontmax)) + ")");
                    if (innerdisplay.length > 4) innerscript.style.setProperty("color", (evaluateColor(innerdisplay[4], nextnum, "None", spawnConveyor, vars)));
                    if (innerdisplay.length > 5) {
                        if (typeof innerdisplay[5] == "string") innerscript.style.setProperty("text-shadow", innerdisplay[5]);
                        else if (Array.isArray(innerdisplay[5]) && innerdisplay[5].length > 3) {
                            let offset1 = "calc(1vw * var(--grid_vw) * " + (4/33 / Math.max(fontmin, fontmax) * innerdisplay[5][0]) + ") ";
                            let offset2 = "calc(1vw * var(--grid_vw) * " + (4/33 / Math.max(fontmin, fontmax) * innerdisplay[5][1]) + ") ";
                            let blur = "calc(1vw * var(--grid_vw) * " + (4/33 / Math.max(fontmin, fontmax) * innerdisplay[5][2]) + ") ";
                            let color = evaluateColor(innerdisplay[5][3], nextnum, "None", spawnConveyor, vars);
                            let shadow = offset1 + offset2 + blur + color;
                            innerscript.style.setProperty("text-shadow", shadow);
                        }
                    }
                    dispelem++;
                }
            }
        }
        if (nextnum < randomTileAmount) tile.style.setProperty("border-style", "solid");
        else tile.style.setProperty("border-style", "none");
    }
    for (let b = 0; b < statBoxes.length; b++) {
        document.getElementById("stat_counter_" + b).innerHTML = CalcArray(statBoxes[b][1]);
    }
}

function displayButtons(shown) {
    for (let button of document.getElementsByClassName("button")) {
        if (shown) button.style.setProperty("display", "flex");
        else button.style.setProperty("display", "none");
    }
    if (currentScreen != "Gameplay") document.getElementById("return_button").style.setProperty("display", "flex");
    for (let d = 0; d < directions.length; d++) colorArrow(d, "Arrow_" + d);
}

function colorArrow(index, ID) { //An arrow button goes black if its direction isn't available
    if (directions[index].length > 9 && CalcArray(directions[index][9]) === false) directionsAvailable[index] = false;
    if (directionsAvailable[index]) {
        document.getElementById(ID).style.setProperty("color", "#ff6666");
        document.getElementById(ID).style.setProperty("border-color", "#ff6666");
        document.getElementById(ID).style.setProperty("background-color", "#ffff88");
    }
    else {
        document.getElementById(ID).style.setProperty("color", "#666666");
        document.getElementById(ID).style.setProperty("border-color", "#666666");
        document.getElementById(ID).style.setProperty("background-color", "#222222");
    }
}

function displayRules(ID, ...elements) { //This basically just clears the element with the corresponding ID and adds elements to it. Each argument after the ID is an array of two entries: the first is the type of element to add, the second is the content of that element
    document.getElementById(ID).innerHTML = "";
    for (let elem of elements) {
        let outer = document.createElement(elem[0]);
        outer.innerHTML = elem[1];
        document.getElementById(ID).appendChild(outer);
    }
}

function loadModifiers() {
    start_modifier_vars = [];
    if (gamemode != 0) {
        if (gamemode == 1) { // 2048
            if (mode_vars[0]) startTileSpawns = [[[1], 90], [[2], 10]];
        }
        else if (gamemode == 4) { // 3125
            if (!(mode_vars[0])) {
                MergeRules = [
                    [2, [["@Next 1 0", "=", "@This 0"], "&&", ["@Next 1 1", "+", "@This 1", "<", 5], "&&", [["@Next 1 1", "+", "@This 1", "!=", 4], "||", ["@This 1", "=", 2]]], true, [["@This 0", ["@Next 1 1", "+", "@This 1"]]], [5, "^", "@This 0", "*", ["@Next 1 1", "+", "@This 1"]], [false, true]],
                    [2, [["@Next 1 0", "=", "@This 0"], "&&", ["@Next 1 1", "+", "@This 1", "=", 5]], true, [[["@This 0", "+", 1], 1]], [5, "^", ["@This 0", "+", 1]], [false, true]]
                ]
                startTileSpawns = [[[0, 1], 80], [[0, 2], 10], [[0, 3], 4], [[0, 4], 4], [[1, 1], 2]];
            }
        }
        else if (gamemode == 25) { // XXXX
            MergeRules[0][0] = mode_vars[0];
            if (mode_vars[1] == Infinity) {
                MergeRules[0][9] = Math.max(width, height);
                MergeRules[1][0] = Math.max(width, height);
                MergeRules[1][9] = Math.max(width, height);
            }
            else {
                MergeRules[0][9] = mode_vars[1];
                MergeRules[1][0] = mode_vars[1];
                MergeRules[1][9] = mode_vars[1];
            }
            if (mode_vars[0] == mode_vars[1]) { // If the minimum and maximum merge lengths are the same, you're effectively playing a "merge n tiles" gamemode, and XXXX makes the colors of the tiles more varied since there's only one "chain" of tiles now.
                TileTypes = [[[1, 0], 1, "#ffffff", "#000000"],
                [[["@This 0", ">", 1], "&&", ["@This 1", "<", 5]], ["@This 0", "^", "@This 1"], ["@HSLA", [222.49223595, "*", "@This 0", "-", 444.9844719, "+", ["@This 1", "-", 1, "*", 19]], 100, [100, "-", ["@This 1", "*", 12.5]], 1], "#000000"],
                [true, ["@This 0", "^", "@This 1"], ["@HSLA", [222.49223595, "*", "@This 0", "-", 444.9844719, "+", ["@This 1", "-", 1, "*", 19]], 100, [0.85, "^", ["@This 1", "-", 5], "*", 50], 1], "#ffffff"],];
                winRequirement = 1;
                displayRules("rules_text", ["h2", "Only Powers of " + mode_vars[1]], ["h1", mode_vars[1]**Math.ceil(Math.log(999.99)/Math.log(mode_vars[1])) + ": XXXX Variant"], ["p", "Merges occur between " + mode_vars[1] + " of the same tile. Get to the " + mode_vars[1]**Math.ceil(Math.log(999.99)/Math.log(mode_vars[1])) + " tile to win!"],
                ["p", "Spawning tiles: 1 (100%)"]);
                statBoxes = [["Score", "@Score"]];
            }
        }
        else if (gamemode == 31) { // Isotopic 256
            MergeRules[1][3][0][1][4] = mode_vars[0];
            displayRules("rules_text", ["h1", "Isotopic 256"], ["p", "Regular 2048, but odd powers of 2 other than 2 itself (8, 32, 128, etc.) are radioactive, disappearing if they go without merging for more than " + mode_vars[0] + "x its number of turns. For aesthetic purposes, the tiles are associated with isotopes of elements with the corresponding atomic mass (though they stop making chemical sense for 256 and above; 256 should be radioactive but isn't, and higher tiles don't have real elements that are that heavy). Get to the <sup>256</sup>No tile to win!"],
            ["p", "Spawning tiles: <sup>2</sup>H (90%), <sup>4</sup>He (10%)"]);
        }
        else if (gamemode == 37) { // 2216.8378200531005859375
            if (mode_vars[0] == 1) {
                MergeRules = [
                    [2, [["@Next 1 0", "=", "@This 0"], "&&", ["@This 1", "=", 1], "&&", ["@Next 1 1", "=", 2]], false, [[["@This 0", "+", 1], 1]], [1.5, "^", "@This 0", "*", 1.5], [false, true]],
                    [2, [["@Next 1 0", "=", "@This 0"], "&&", ["@This 1", "=", 2], "&&", ["@Next 1 1", "=", 2]], true, [["@This 0", 1]], [1.5, "^", "@This 0"], [false, true]],
                    [2, [["@This 1", "=", 1], "&&", ["@Next 1 0", "=", "Div2"]], false, [["@This 0", 2]], [1.5, "^", "@This 0", "/", 2], [false, true]],
                    [2, [["@This 0", "=", "Div2"], "&&", ["@Next 1 0", "=", "Div2"]], true, [["Div2", "@Signless"]], 0, [false, true]],
                ];
                startTileSpawns = [[[0, 1], 50], [["Div2", "@Signless"], 50]];
            }
        }
        else if (gamemode == 39) { // 2592
            if (mode_vars[0] == 0) {
                statBoxes = [["Moves", "@Moves"], ["Discovered Tiles", ["@DiscTiles", "arr_length"]], ["Score", "@Score"]];
                MergeRules[0][1][8][0] = "@Moves";
                MergeRules[1][1][4][0] = "@Moves";
            }
            else if (mode_vars[0] == 1) {
                statBoxes = [["Moves Where A Merge Occured", "@MergeMoves"], ["Discovered Tiles", ["@DiscTiles", "arr_length"]], ["Score", "@Score"]];
                MergeRules[0][1][8][0] = "@MergeMoves";
                MergeRules[1][1][4][0] = "@MergeMoves";
            }
            else if (mode_vars[0] == 2) {
                statBoxes = [["Discovered Tiles", ["@DiscTiles", "arr_length"]], ["Score", "@Score"], ["Merges Before This Move", "@MergesBefore"]];
                MergeRules[0][1][8][0] = "@MergesBefore";
                MergeRules[1][1][4][0] = "@MergesBefore";
            }
            else if (mode_vars[0] == 3) {
                statBoxes = [["Discovered Tiles", ["@DiscTiles", "arr_length"]], ["Score", "@Score"], ["Merges", "@Merges"]];
                MergeRules[0][1][8][0] = "@Merges";
                MergeRules[1][1][4][0] = "@Merges";
            }
        }
        else if (gamemode == 40) { // Wildcard 2048
            if (mode_vars[0]) {
                MergeRules = [[[1, "@end_vars", 0, "@repeat", ["@var_retain", "@This 0", "min", "@Next 1 0", ">=", "@Var 0"], "@if", ["@var_retain", ["@var_retain", "@This 0", "floor", "@Var 0", "/", "@Var 0", "%", 2, "=", 1], "&&", ["@var_retain", "@Next 1 0", "floor", "@Var 0", "/", "@Var 0", "%", 2, "=", 1]], "+", "@Var 0", "@end-if", "@edit_var", 0, ["@var_retain", "@Var 0", "*", 2], "@end-repeat"], "@end_vars", 2, ["@var_retain", "@Var 0", ">", 0], true, [[["@This 0", "+", "@Next 1 0"]]], ["@This 0", "+", "@Next 1 0"], [false, true]]];
                if (modifiers[13] != "None") MergeRules = [[[1, "@end_vars", 0, "@repeat", ["@var_retain", "@This 0", "min", "@Next 1 0", ">=", "@Var 0"], "@if", ["@var_retain", ["@var_retain", "@This 0", "floor", "@Var 0", "/", "@Var 0", "%", 2, "=", 1], "&&", ["@var_retain", "@Next 1 0", "floor", "@Var 0", "/", "@Var 0", "%", 2, "=", 1]], "+", "@Var 0", "@end-if", "@edit_var", 0, ["@var_retain", "@Var 0", "*", 2], "@end-repeat"], "@end_vars", 2, ["@var_retain", "@Var 0", ">", 0, "&&", ["@This 1", "=", "@Next 1 1"]], true, [[["@This 0", "+", "@Next 1 0"], "@This 1"]], ["@This 0", "+", "@Next 1 0"], [false, true]]];
                if (modifiers[13] == "Interacting") {
                    MergeRules[1] = [2, [["@This 0", "=", "@Next 1 0"], "&&", ["@This 1", "!=", "@Next 1 1"]], true, [], 0, [true, true]];
                    MergeRules.push([[1, "@end_vars", 0, "@repeat", ["@var_retain", "@This 0", "min", "@Next 1 0", ">=", "@Var 0"], "@if", ["@var_retain", ["@var_retain", "@This 0", "floor", "@Var 0", "/", "@Var 0", "%", 2, "=", 1], "&&", ["@var_retain", "@Next 1 0", "floor", "@Var 0", "/", "@Var 0", "%", 2, "=", 1]], "+", "@Var 0", "@end-if", "@edit_var", 0, ["@var_retain", "@Var 0", "*", 2], "@end-repeat"], "@end_vars", 2, ["@var_retain", "@Var 0", ">", 0, "&&", ["@This 1", "=", 1], "&&", ["@Next 1 1", "=", -1], "&&", ["@This 0", "!=", "@Next 1 0"]], false, [[["@This 0", "-", "@Next 1 0", "abs"], ["@This 0", "-", "@Next 1 0", "sign"]]], 0, [false, true]]);
                }
            }
        }
        else if (gamemode == 41) { // X^Y
            MergeRules[0][11] = mode_vars[1];
            if (mode_vars[0] != Infinity) {
                if (modifiers[13] == "None") start_game_vars = [["@Literal", [["@This 0", "^", "@This 1", "+", ["@Next", "arr_reduce", 0, ["+", ["@var_retain", ["@var_retain", "@Var -1", "arr_elem", 0], "^", ["@var_retain", "@Var -1", "arr_elem", 1]]]]], ["@var_retain", 1, "@if", ["@var_retain", "@Var 0", ">", 1], "2nd", "@Var 0", "log", 2, "ceil", 1, "min", mode_vars[0], "@end-if"], 2, true, "@end_vars", 0, "@if", ["@var_retain", "@Var 0", "<=", 1], "@edit_var", 2, "@Var 0", "@edit_var", 1, 1.5, "@end-if", "@else", "@repeat", ["@var_retain", "@Var 1", ">=", 2, "&&", "@Var 3"], "@edit_var", 2, ["@var_retain", "@Var 0", "^", ["@var_retain", 1, "/", "@Var 1"], "floor", 1], "@if", ["@var_retain", "@Var 2", "^", "@Var 1", "=", "@Var 0"], "@edit_var", 3, false, "@end-if", "@else", "@edit_var", 2, ["@var_retain", "@Var 2", "+", 1], "@if", ["@var_retain", "@Var 2", "^", "@Var 1", "=", "@Var 0"], "@edit_var", 3, false, "@end-if", "@else", "@edit_var", 1, ["@var_retain", "@Var 1", "-", 1], "@end-else", "@end-else", "@end-repeat", "@if", ["@var_retain", "@Var 1", "=", 1], "@edit_var", 2, 0, "@end-if", "@end-else", "2nd", "@Var 2", "arr_push", "@Var 1"]]];
                else start_game_vars = [["@Literal", [["@This 0", "^", "@This 1", "*", "@This 2", "+", ["@Next", "arr_reduce", 0, ["+", ["@var_retain", ["@var_retain", "@Var -1", "arr_elem", 0], "^", ["@var_retain", "@Var -1", "arr_elem", 1], "*", ["@var_retain", "@Var -1", "arr_elem", 2]]]]], ["@var_retain", 1, "@if", ["@var_retain", "@Var 0", "abs", ">", 1], "2nd", "@Var 0", "abs", "log", 2, "ceil", 1, "min", mode_vars[0], "@end-if"], 2, true, "@end_vars", 0, "@if", ["@var_retain", "@Var 0", "abs", "<=", 1], "@edit_var", 2, ["@var_retain", "@Var 0", "abs"], "@edit_var", 1, 1.5, "@end-if", "@else", "@repeat", ["@var_retain", "@Var 1", ">=", 2, "&&", "@Var 3"], "@edit_var", 2, ["@var_retain", "@Var 0", "abs", "^", ["@var_retain", 1, "/", "@Var 1"], "floor", 1], "@if", ["@var_retain", "@Var 2", "^", "@Var 1", "=", ["@var_retain", "@Var 0", "abs"]], "@edit_var", 3, false, "@end-if", "@else", "@edit_var", 2, ["@var_retain", "@Var 2", "+", 1], "@if", ["@var_retain", "@Var 2", "^", "@Var 1", "=", ["@var_retain", "@Var 0", "abs"]], "@edit_var", 3, false, "@end-if", "@else", "@edit_var", 1, ["@var_retain", "@Var 1", "-", 1], "@end-else", "@end-else", "@end-repeat", "@if", ["@var_retain", "@Var 1", "=", 1], "@edit_var", 2, 0, "@end-if", "@end-else", "2nd", "@Var 2", "arr_push", "@Var 1", "arr_push", ["@var_retain", "@Var 0", "sign"]]]];
            }
        }
        else if (gamemode == 44) { // mod 27
            MergeRules[0][9] = Math.max(width, height);
        }
        randomTileAmount = modifiers[1];
        startTileAmount = modifiers[2];
        multiMerge = modifiers[3];
        spawnLocation = modifiers[4];
        if (modifiers[5] != "Custom") { //Adding directions based on the grid shape and available directions modifiers; if the Custom Grid is enabled, this is skipped so the directions you chose remain
            directions = [];
            if (modifiers[5] == "Checkerboard") {
                if (modifiers[10] == "Orthogonal" || modifiers[10] == "Both") {
                    directions.push([[-1, -1, modifiers[0], 0, [1, true, true, true]], "&#8592;", 5/33, 5/33, 3/33, 6/33, 6/33, ["KeyQ"], 45]);
                    directions.push([[-1, 1, modifiers[0], 0, [1, true, true, true]], "&#8593;", 5/33, 3/33, 6/33, 22/33, ["KeyE"], 45]);
                    directions.push([[1, -1, modifiers[0], 0, [1, true, true, true]], "&#8595;", 5/33, 3/33, 22/33, 6/33, ["KeyZ"], 45]);
                    directions.push([[1, 1, modifiers[0], 0, [1, true, true, true]], "&#8594;", 5/33, 3/33, 22/33, 22/33, ["KeyC"], 45]);
                }
                if (modifiers[10] == "Diagonal" || modifiers[10] == "Both") {
                    directions.push([[-2, 0, modifiers[0], 0, [1, true, true, true]], "&#8593;&#8593;", 5/33, 5/33, 2.5/33, 6/33, 14/33, ["ArrowUp", "KeyW"]]);
                    directions.push([[2, 0, modifiers[0], 0, [1, true, true, true]], "&#8595;&#8595;", 5/33, 5/33, 2.5/33, 22/33, 14/33, ["ArrowDown", "KeyS", "KeyX"]]);
                    directions.push([[0, -2, modifiers[0], 0, [1, true, true, true]], "&#8592;&#8592;", 5/33, 5/33, 2.5/33, 14/33, 6/33, ["ArrowLeft", "KeyA"]]);
                    directions.push([[0, 2, modifiers[0], 0, [1, true, true, true]], "&#8594;&#8594;", 5/33, 5/33, 2.5/33, 14/33, 22/33, ["ArrowRight", "KeyD"]]);
                }
            }
            else if (modifiers[5] == "Hexagon") {
                if (modifiers[10] == "Orthogonal" || modifiers[10] == "Both") {
                    directions.push([[-1, -1, modifiers[0], 0, [1, true, true, true]], "&#8592;", 5/33, 5/33, 3/33, 6/33, 9/33, ["KeyQ"], 45]);
                    directions.push([[-1, 1, modifiers[0], 0, [1, true, true, true]], "&#8593;", 5/33, 5/33, 3/33, 6/33, 19/33, ["KeyW"], 45]);
                    directions.push([[1, -1, modifiers[0], 0, [1, true, true, true]], "&#8595;", 5/33, 5/33, 3/33, 22/33, 9/33, ["KeyZ"], 45]);
                    directions.push([[1, 1, modifiers[0], 0, [1, true, true, true]], "&#8594;", 5/33, 5/33, 3/33, 22/33, 19/33, ["KeyX"], 45]);
                    directions.push([[0, -2, modifiers[0], 0, [1, true, true, true]], "&#8592;", 5/33, 5/33, 3/33, 14/33, 4/33, ["KeyA"]]);
                    directions.push([[0, 2, modifiers[0], 0, [1, true, true, true]], "&#8594;", 5/33, 5/33, 3/33, 14/33, 24/33, ["KeyS"]]);
                }
                if (modifiers[10] == "Diagonal" || modifiers[10] == "Both") {
                    directions.push([[-2, 0, modifiers[0], 0, [1, true, true, true]], "&#8593;", 4/33, 4/33, 2.5/33, 0/33, 14/33, ["KeyO"]]);
                    directions.push([[2, 0, modifiers[0], 0, [1, true, true, true]], "&#8595;", 4/33, 4/33, 2.5/33, 28/33, 14/33, ["KeyK"]]);
                    directions.push([[-1, -3, modifiers[0], 0, [1, true, true, true]], "&#8592;", 4/33, 4/33, 2.5/33, 7/33, 2/33, ["KeyI"], 30]);
                    directions.push([[-1, 3, modifiers[0], 0, [1, true, true, true]], "&#8593;", 4/33, 4/33, 2.5/33, 7/33, 26/33, ["KeyI"], 60]);
                    directions.push([[1, -3, modifiers[0], 0, [1, true, true, true]], "&#8595;", 4/33, 4/33, 2.5/33, 21/33, 2/33, ["KeyI"], 60]);
                    directions.push([[1, 3, modifiers[0], 0, [1, true, true, true]], "&#8594;", 4/33, 4/33, 2.5/33, 21/33, 26/33, ["KeyI"], 30]);
                }
            }
            else if (modifiers[5] == "4D") {
                if (modifiers[6] > 1) {
                    directions.push([[0, -1, modifiers[0], 0, [1, true, true, true]], "&#8592;", 4/33, 4/33, 2.5/33, 14.5/33, 8.5/33, ["ArrowLeft", "KeyA"]]);
                    directions.push([[0, 1, modifiers[0], 0, [1, true, true, true]], "&#8594;", 4/33, 4/33, 2.5/33, 14.5/33, 20.5/33, ["ArrowRight", "KeyD"]]);
                }
                if (modifiers[7] > 1) {
                    directions.push([[-1, 0, modifiers[0], 0, [1, true, true, true]], "&#8593;", 4/33, 4/33, 2.5/33, 8.5/33, 14.5/33, ["ArrowUp", "KeyW"]]);
                    directions.push([[1, 0, modifiers[0], 0, [1, true, true, true]], "&#8595;", 4/33, 4/33, 2.5/33, 20.5/33, 14.5/33, ["ArrowDown", "KeyS"]]);
                }
                if (modifiers[8] > 1) {
                    directions.push([[0, modifiers[6] * -1 - 1, modifiers[0], 0, [1, true, true, true]], "&#8592;&#8592;", 4/33, 4/33, 2/33, 14.5/33, 2.5/33, ["KeyJ"]]);
                    directions.push([[0, modifiers[6] + 1, modifiers[0], 0, [1, true, true, true]], "&#8594;&#8594;", 4/33, 4/33, 2/33, 14.5/33, 26.5/33, ["KeyL"]]);
                }
                if (modifiers[9] > 1) {
                    directions.push([[modifiers[7] * -1 - 1, 0, modifiers[0], 0, [1, true, true, true]], "&#8593;&#8593;", 4/33, 4/33, 2/33, 2.5/33, 14.5/33, ["KeyI"]]);
                    directions.push([[modifiers[7] + 1, 0, modifiers[0], 0, [1, true, true, true]], "&#8595;&#8595;", 4/33, 4/33, 2/33, 26.5/33, 14.5/33, ["KeyK"]]);
                }
            }
            else {
                if (modifiers[10] == "Orthogonal" || modifiers[10] == "Both") {
                    directions.push([[-1, 0, modifiers[0], 0, [1, true, true, true]], "&#8593;", 5/33, 5/33, 3/33, 6/33, 14/33, ["ArrowUp", "KeyW"]]);
                    directions.push([[1, 0, modifiers[0], 0, [1, true, true, true]], "&#8595;", 5/33, 5/33, 3/33, 22/33, 14/33, ["ArrowDown", "KeyS", "KeyX"]]);
                    directions.push([[0, -1, modifiers[0], 0, [1, true, true, true]], "&#8592;", 5/33, 5/33, 3/33, 14/33, 6/33, ["ArrowLeft", "KeyA"]]);
                    directions.push([[0, 1, modifiers[0], 0, [1, true, true, true]], "&#8594;", 5/33, 5/33, 3/33, 14/33, 22/33, ["ArrowRight", "KeyD"]]);
                }
                if (modifiers[10] == "Diagonal" || modifiers[10] == "Both") {
                    directions.push([[-1, -1, modifiers[0], 0, [1, true, true, true]], "&#8592;", 5/33, 5/33, 3/33, 6/33, 6/33, ["KeyQ"], 45]);
                    directions.push([[-1, 1, modifiers[0], 0, [1, true, true, true]], "&#8593;", 5/33, 5/33, 3/33, 6/33, 22/33, ["KeyE"], 45]);
                    directions.push([[1, -1, modifiers[0], 0, [1, true, true, true]], "&#8595;", 5/33, 5/33, 3/33, 22/33, 6/33, ["KeyZ"], 45]);
                    directions.push([[1, 1, modifiers[0], 0, [1, true, true, true]], "&#8594;", 5/33, 5/33, 3/33, 22/33, 22/33, ["KeyC"], 45]);
                }
            }
            if (modifiers[11]) {
                if (modifiers[5] == "4D") directions.push([[0, 0, 0, 0, [1, true, true, true]], "&#8226;", 4/33, 4/33, 2.5/33, 14.5/33, 14.5/33, ["Space"]]);
                else directions.push([[0, 0, 0, 0, [1, true, true, true]], "&#8226;", 5/33, 5/33, 3/33, 14/33, 14/33, ["Space"]]);
            }
        }
        if (modifiers[15] == "Simple" && gamemode != 14 && (gamemode != 37 || mode_vars[0] == 0) && gamemode != 40 && gamemode != 43) { // 2049, Wildcard 2048, 2216.838, and 1321 ignore the simple spawns: 2049 needs both 1s and -1s, 2216.838 and 1321 have special tiles that make them work (÷2s and +1s respectively), and simple spawns would defeat the whole point of Wildcard 2048
            if (gamemode == 30) startTileSpawns = [["Box", 20, [-1], 4, [-2], 4]];
            else startTileSpawns = [startTileSpawns[0]];
        }
        else if (modifiers[15] == "Equal" && gamemode != 29 && gamemode != 30) { //1535 1536 1537 and 3072 ignore the equal spawns; honestly I don't remember why 1535 1536 1537 does, but 3072 ignores it so the bonus tiles aren't messed up, as their probability changes depending on whether you've unlocked them or not
            for (let t = 0; t < startTileSpawns.length; t++) {
                startTileSpawns[t][1] = 1;
            }
        }
        if (modifiers[19] > 1) {
            spawnConditions = ["@Moves", "+", 1, "%", modifiers[19], "=", 0];
            if (indexOfNestedPrimArray("@Moves", statBoxes) == -1) statBoxes.push(["Moves", "@Moves"]);
        }
        if (modifiers[20]) {
            let mnum = start_modifier_vars.length;
            start_modifier_vars.push([0, 0, 0]);
            scripts.push([[["@VDir", "arr_push", "@HDir", "arr_push", "@SlideAmount"], "@end_vars", 0, "@edit_mvar", mnum, ["@var_retain", "@Var 0", "@if", ["@var_retain", "@Var 0", "=", ("@MVar " + mnum)], "2nd", ["@Literal", 0, 0, 0], "@end-if"]], "EndTurn"]);
            for (let m = 0; m < MergeRules.length; m++) {
                let mstart = 0;
                if (MergeRules[m][0] === "@include_gvars") mstart = 1;
                if ((MergeRules[m]).indexOf("@end_vars") > -1) mstart = (MergeRules[m]).indexOf("@end_vars") + 1;
                MergeRules[m][mstart + 1].push("&&", [["@VDir", "arr_push", "@HDir", "arr_push", "@SlideAmount"], "=", ("@MVar " + mnum)]);
            }
        }
        if (modifiers[13] != "None" && gamemode != 14 && gamemode != 31 && gamemode != 40 && gamemode != 41 && gamemode != 43 && gamemode != 44) { // 2049, Isotopic 256, Wildcard 2048, X^Y, 1321, and mod 27 all do special things with negative tiles, but this script is what adds the negative tiles to the rest of the modes
            TileNumAmount++;
            let neganum = TileNumAmount - 1;
            let positiveTiles = [];
            let negativeTiles = [];
            let signlessTiles = [];
            for (let t = 0; t < TileTypes.length - signlessTiles.length; t++) {
                if (Array.isArray(TileTypes[t + signlessTiles.length][0]) && indexOfNestedPrimArray("@Signless", TileTypes[t + signlessTiles.length][0]) != -1) {
                    signlessTiles.push(structuredClone(TileTypes[t + signlessTiles.length]));
                    signlessTiles[signlessTiles.length - 1][0].push(0);
                    t--;
                    continue;
                }
                positiveTiles.push(structuredClone(TileTypes[t + signlessTiles.length]));
                negativeTiles.push(structuredClone(TileTypes[t + signlessTiles.length]));
                if (eqPrimArrays(arrayTypes(TileTypes[t + signlessTiles.length][0]), ["number"])) {
                    positiveTiles[t][0].push(1);
                    negativeTiles[t][0].push(-1);
                }
                else if (TileTypes[t + signlessTiles.length][0] === true) {
                    positiveTiles[t][0] = ["@This " + neganum, "=", 1];
                    negativeTiles[t][0] = ["@This " + neganum, "=", -1];
                }
                else {
                    positiveTiles[t][0].push("&&", ["@This " + neganum, "=", 1]);
                    negativeTiles[t][0].push("&&", ["@This " + neganum, "=", -1]);
                }
                if (typeof negativeTiles[t][1] == "number") negativeTiles[t][1] *= -1;
                else if (Array.isArray(negativeTiles[t][1]) && negativeTiles[t][1].indexOf("@no-negative-sign") == -1) negativeTiles[t][1] = [negativeTiles[t][1], "*", -1];
                negativeTiles[t][2] = ["@rotate", 180, true, negativeTiles[t][2]];
                negativeTiles[t][3] = ["@rotate", 180, true, negativeTiles[t][3]];
            }
            TileTypes = signlessTiles.concat(positiveTiles, negativeTiles);
            let signlessSpawns = [];
            for (let s = 0; s < startTileSpawns.length; s++) {
                if (Array.isArray(startTileSpawns[s][0]) && indexOfNestedPrimArray("@Signless", startTileSpawns[s][0]) != -1) {
                    signlessSpawns.push(structuredClone(startTileSpawns[s]));
                    signlessSpawns[signlessSpawns.length - 1][0].push(0);
                    startTileSpawns.splice(s, 1);
                    if (typeof signlessSpawns[signlessSpawns.length - 1][1] == "number") signlessSpawns[signlessSpawns.length - 1][1] *= 2;
                    else if (Array.isArray(signlessSpawns[signlessSpawns.length - 1][1])) signlessSpawns[signlessSpawns.length - 1][1] = [signlessSpawns[signlessSpawns.length - 1][1], "*", 2];
                    s--;
                }
            }
            let positiveSpawns = structuredClone(startTileSpawns);
            let negativeSpawns = structuredClone(startTileSpawns);
            for (let i = 0; i < startTileSpawns.length; i++) {
                for (let j = 0; j < startTileSpawns[i].length; j++) {
                    if (Array.isArray(startTileSpawns[i][j])) {
                        positiveSpawns[i][j].push(1);
                        negativeSpawns[i][j].push(-1);
                    }
                }
            }
            startTileSpawns = signlessSpawns.concat(positiveSpawns, negativeSpawns);
            winRequirement *= 2;
            let wlength = winConditions.length;
            for (let w = 0; w < wlength; w++) {
                if (Array.isArray(winConditions[w]) && eqPrimArrays(arrayTypes(winConditions[w]), ["number"])) {
                    winConditions.push(structuredClone(winConditions[w]));
                    winConditions[winConditions.length - 1].push(-1);
                    winConditions[w].push(1);
                }
            }
            for (let m = 0; m < MergeRules.length; m++) {
                let mstart = 0;
                if (MergeRules[m][0] === "@include_gvars") mstart = 1;
                if ((MergeRules[m]).indexOf("@end_vars") > -1) mstart = (MergeRules[m]).indexOf("@end_vars") + 1;
                let addInfo = MergeRules[m][mstart];
                if (MergeRules[m].length > 6) addInfo = MergeRules[m][mstart + 6];
                if (signlessTiles.length == 0) {
                    for (let i = 1; i < addInfo; i++) MergeRules[m][mstart + 1].push("&&", ["@Next " + i + " " + neganum, "=", "@This " + neganum]);
                    if (eqPrimArrays(MergeRules[m][mstart + 1][0], ["@NextNE -1 0", "!=", "@This 0"])) MergeRules[m][mstart + 1].unshift(["@NextNE -1 " + neganum, "!=", "@This " + neganum], "||");
                    for (let r = 0; r < MergeRules[m][mstart + 3].length; r++) MergeRules[m][mstart + 3][r].push("@This " + neganum);
                }
                else {
                    let negadetector = ["@This " + neganum, "@if", ["@Parent -2", "=", 0], "2nd", "@Next", "arr_reduce", 0, ["@if", ["@var_retain", "@Var -1", "arr_elem", neganum, "!=", 0, "&&", ["@Parent -3", "=", 0]], "2nd", "@Var -1", "arr_elem", neganum, "@end-if"], "@end-if"];
                    for (let i = 1; i < addInfo; i++) MergeRules[m][mstart + 1].push("&&", [["@Next " + i + " " + neganum, "=", negadetector, "||", ["@Next " + i + " " + neganum, "=", 0]]]);
                    if (eqPrimArrays(MergeRules[m][mstart + 1][0], ["@NextNE -1 0", "!=", "@This 0"])) MergeRules[m][mstart + 1].unshift(["@NextNE -1 " + neganum, "!=", negadetector, "&&", ["@Next " + i + " " + neganum, "!=", 0]], "||");
                    for (let r = 0; r < MergeRules[m][mstart + 3].length; r++) MergeRules[m][mstart + 3][r].push(negadetector); 
                }
            }
            if (modifiers[13] == "Interacting") {
                let annihilate_reqs = [["@Next 1 0", "=", "@This 0"]];
                for (let i = 1; i < neganum; i++) {
                    annihilate_reqs.push("&&", ["@Next 1 " + i, "=", "@This " + i]);
                }
                if (signlessTiles.length == 0) {
                    annihilate_reqs.push("&&", ["@Next 1 " + neganum, "!=", "@This " + neganum]);
                }
                else {
                    annihilate_reqs.push("&&", ["@Next 1 " + neganum, "!=", "@This " + neganum], "&&", ["@This " + neganum, "!=", 0], "&&", ["@Next 1 " + neganum, "!=", 0]);
                }
                MergeRules.push([2, annihilate_reqs, true, [], 0, [true, true]]);
            }
        }
        if (modifiers[12]) {
            let ZArray = ["Zero"];
            for (let i = 1; i < TileNumAmount; i++) ZArray.push(0);
            if (gamemode == 44) ZArray[0] = 0; // mod 27 already has 0 tiles, so the modifier co-opts those to use as the Garbage 0s
            else TileTypes.unshift([ZArray, "0", "#444444", "#888888"]);
            for (let m = 0; m < MergeRules.length; m++) {
                let mstart = 0;
                if (MergeRules[m][0] === "@include_gvars") mstart = 1;
                if ((MergeRules[m]).indexOf("@end_vars") > -1) mstart = (MergeRules[m]).indexOf("@end_vars") + 1;
                MergeRules[m][mstart + 1].push("&&");
                MergeRules[m][mstart + 1].push(["@This 0", "!=", ZArray[0]]);
                if (MergeRules[m].length - mstart > 5) {
                    MergeRules[m][mstart + 5] = [];
                    for (let e = 0; e < MergeRules[m][mstart]; e++) MergeRules[m][mstart + 5].push(false);
                }
                if (MergeRules[m][mstart] == 0) MergeRules[m][mstart + 3].push(ZArray);
                else MergeRules[m][mstart + 3].push("fill", ZArray);
            }
            let ZRid = [];
            for (let z = 0; z < ZArray.length; z++) {
                ZRid.push(["@This " + z, "=", ZArray[z]], "&&", ["@Next 1 " + z, "=", ZArray[z]], "&&");
            }
            ZRid.pop();
            MergeRules.unshift([2, ZRid, true, [ZArray], 0, [true, true]]);
        }
        let BlackBox = ["BlackBox"];
        for (let i = 1; i < TileNumAmount; i++) BlackBox.push(0);
        if (modifiers[18] > 0 || (modifiers[5] == "Custom" && indexOfNestedPrimArray(BlackBox, startingGrid) != -1)) {
            TileTypes.unshift([BlackBox, "", "radial-gradient(#000000 0% 80%, #ffffff 90%)", "#ffffff"]);
            for (let m = 0; m < MergeRules.length; m++) {
                let mstart = 0;
                if (MergeRules[m][0] === "@include_gvars") mstart = 1;
                if ((MergeRules[m]).indexOf("@end_vars") > -1) mstart = (MergeRules[m]).indexOf("@end_vars") + 1;
                MergeRules[m][mstart + 1].push("&&");
                MergeRules[m][mstart + 1].push(["@This 0", "!=", "BlackBox"]);
            }
        }
    }
}

function loadResettingModifiers() { //Randomly-Placed Holes and Randomly-Placed Box Tiles re-randomize after each game, but the rest of the modifiers don't, so those two are loaded here instead of in loadModifiers
    if (gamemode != 0) {
        let BlackBox = ["BlackBox"];
        for (let i = 1; i < TileNumAmount; i++) BlackBox.push(0);
        let availableTiles = [];
        for (let h = 0; h < height; h++) {
            for (let w = 0; w < width; w++) {
                availableTiles.push([h, w]);
            }
        }
        let voidboxes = 0;
        let chosen = 0;
        while (voidboxes < modifiers[17] && availableTiles.length > 0) {
            chosen = getRndInteger(0, availableTiles.length - 1);
            if (Grid[availableTiles[chosen][0]][availableTiles[chosen][1]] == "@Empty") {
                Grid[availableTiles[chosen][0]][availableTiles[chosen][1]] = "@Void";
                voidboxes++;
            }
            availableTiles.splice(chosen, 1);
        }
        voidboxes = 0;
        while (voidboxes < modifiers[18] && availableTiles.length > 0) {
            chosen = getRndInteger(0, availableTiles.length - 1);
            if (Grid[availableTiles[chosen][0]][availableTiles[chosen][1]] == "@Empty") {
                Grid[availableTiles[chosen][0]][availableTiles[chosen][1]] = BlackBox;
                voidboxes++;
            }
            availableTiles.splice(chosen, 1);
        }
    }
}

//Custom grid and directions in modifiers

function createCustomGrid() {
    while (document.getElementById("modifiers_customGrid").lastElementChild) document.getElementById("modifiers_customGrid").removeChild(document.getElementById("modifiers_customGrid").lastElementChild);
    document.documentElement.style.setProperty("--width", width);
    document.documentElement.style.setProperty("--height", height);
    tsize = 100 * Math.min(1, width/height)/width;
    document.documentElement.style.setProperty("--tile_size", tsize * 0.9 + "%");
    document.documentElement.style.setProperty("--th_dist", tsize * (1 - 0.1 * 1/(width + 1)) * Math.max(1, height/width));
    document.documentElement.style.setProperty("--tv_dist", tsize * (1 - 0.1 * 1/(height + 1)) * Math.max(1, width/height));
    startingGrid = [];
    for (let row = 0; row < height; row++) {
        startingGrid.push([]);
        for (let column = 0; column < width; column++) {
            startingGrid[row].push("@Empty");
            let newEmpty = document.createElement("div");
            newEmpty.id = "Empty_" + row + "_" + column;
            newEmpty.classList.add("customGridTile");
            document.getElementById("modifiers_customGrid").appendChild(newEmpty);
        }
    }
    customGridTiles = document.getElementById("modifiers_customGrid").children;
    let Positions = [];
    for (let row = 0; row < height; row++) {
        Positions.push([]);
        for (let column = 0; column < width; column++) {
            Positions[row].push([]);
        }
    }
    for (let t of customGridTiles) {
        let char = 6;
        let hcoord = "";
        let vcoord = "";
        while (t.id[char] != "_") {vcoord += t.id[char]; char++;}
        char++;
        while (char < t.id.length) {hcoord += t.id[char]; char++;}
        hcoord = Number(hcoord);
        vcoord = Number(vcoord);
        let hsize = Number(getComputedStyle(document.documentElement).getPropertyValue("--th_dist"));
        let vsize = Number(getComputedStyle(document.documentElement).getPropertyValue("--tv_dist"));
        t.style.setProperty("left", hsize * (0.075 + hcoord) + "%");
        t.style.setProperty("top", vsize * (0.075 + vcoord) + "%");
        Positions[vcoord][hcoord] = [hsize * (0.075 + hcoord), vsize * (0.075 + vcoord)];
        t.addEventListener("click", function(){
            if (startingGrid[vcoord][hcoord] == "@Empty") {
                startingGrid[vcoord][hcoord] = "@Void";
                this.style.setProperty("background-color", "#e8de8110");
                this.style.setProperty("background-image", "none");
            }
            else if (startingGrid[vcoord][hcoord] == "@Void") {
                startingGrid[vcoord][hcoord] = "@BlackBox";
                this.style.setProperty("background-color", "#e8de81");
                this.style.setProperty("background-image", "radial-gradient(#000000 0% 80%, #ffffff 90%)");
            }
            else {
                startingGrid[vcoord][hcoord] = "@Empty";
                this.style.setProperty("background-color", "#e8de81");
                this.style.setProperty("background-image", "none");
            }
        })
    }
}

function createCustomArrows() {
    while (document.getElementById("modifiers_customArrowContainer").children.length > 0) document.getElementById("modifiers_customArrowContainer").removeChild(document.getElementById("modifiers_customArrowContainer").lastElementChild);
    directionsAvailable = [];
    for (let d = 0; d < directions.length; d++) {
        directionsAvailable.push(true);
        let newArrow = document.createElement("div");
        newArrow.id = "CustomArrow_" + d;
        newArrow.classList.add("arrow");
        newArrow.classList.add("button");
        newArrow.classList.add("hover_grow");
        document.getElementById("modifiers_customArrowContainer").appendChild(newArrow);
        let newArrowp = document.createElement("p");
        newArrow.appendChild(newArrowp);
        newArrowp.innerHTML = directions[d][1];
        newArrow.style.setProperty("width", directions[d][2] * 100 + "%");
        newArrow.style.setProperty("height", directions[d][3] * 100 + "%");
        newArrow.style.setProperty("border-width", "calc(var(--modifiers_base_size) * 2.24 * " + Math.min(directions[d][2], directions[d][3]) + ")");
        newArrow.style.setProperty("font-size", "calc(var(--modifiers_base_size) * 56 *" + directions[d][4] + ")");
        newArrow.style.setProperty("top", directions[d][5] * 100 + "%");
        newArrow.style.setProperty("left", directions[d][6] * 100 + "%");
        if (directions[d].length > 8) newArrowp.style.setProperty("rotate", directions[d][8] + "deg");
        if (screenVars[0] === d) newArrow.style.setProperty("box-shadow", "0px 0px calc(var(--modifiers_base_size) * 2) calc(var(--modifiers_base_size) * 1) #fff");
        else newArrow.style.setProperty("box-shadow", "none");
        newArrow.addEventListener("click",  function(){
            if (screenVars[0] === d) screenVars[0] = -1;
            else screenVars[0] = d;
            createCustomArrows();
            displayModifiers(3.2);
        }
        )
    }
}

//Calculations for CalcArrays, the kinds of arrays seen all across the project, especially in TileTypes and MergeRules

function operation(n1, operator, n2) {
    let additional = [];
    if (arguments.length > 3) additional = arguments[3];
    let result = n1;
    switch (operator) {
        //number operators (mostly)
        case "+":
        case "+B":
        case "str_concat":
            result = n1 + n2;
        break;
        case "-":
        case "-B":
            result = n1 - n2;
        break;
        case "*":
        case "*B":
            result = n1 * n2;
        break;
        case "/":
        case "/B":
            result = n1 / n2;
        break;
        case "%":
        case "%B":
            result = n1 % n2;
        break;
        case "mod":
        case "modB":
            result = mod(n1, n2);
        break;
        case "^":
        case "**":
        case "^B":
        case "**B":
            result = n1 ** n2;
        break;
        case "log":
            result = Math.log(n1)/Math.log(n2);
        break;
        case "round":
            result = Math.round(n1/n2) * n2;
        break;
        case "floor":
            result = Math.floor(n1/n2) * n2;
        break;
        case "ceil":
        case "ceiling":
            result = Math.ceil(n1/n2) * n2;
        break;
        case "trunc":
            result = Math.trunc(n1/n2) * n2;
        break;
        case "abs":
        case "absB":
            result = abs(n1);
        break;
        case "sign":
        case "signB":
            result = sign(n1);
        break;
        case "sin":
            result = Math.sin(n1);
        break;
        case "cos":
            result = Math.cos(n1);
        break;
        case "tan":
            result = Math.tan(n1);
        break;
        case "gcd":
        case "gcdB":
            result = gcd(n1, n2);
        break;
        case "lcm":
        case "lcmB":
            result = lcm(n1, n2);
        break;
        case "factorial":
        case "factorialB":
            result = factorial(n1);
        break;
        case "prime":
        case "primeB":
            result = prime(n1);
        break;
        case "expomod":
        case "expomodB":
            result = expomod(n1, n2);
        break;
        case "rand_int":
            result = getRndInteger(Math.ceil(n1), Math.floor(n2));
        break;
        case "rand_float":
            result = getRndFloat(n1, n2);
        break;
        case "defaultAbbrev":
        case "defaultAbbrevB":
            result = defaultAbbreviate(n1);
        break;
        //comparisons
        case "=":
            if (Array.isArray(n1) && Array.isArray(n2)) result = eqPrimArrays(n1, n2);
            else result = (n1 === n2);
        break;
        case ">":
            result = (n1 > n2);
        break;
        case "<":
            result = (n1 < n2);
        break;
        case ">=":
            result = (n1 >= n2);
        break;
        case "<=":
            result = (n1 <= n2);
        break;
        case "!=":
            result = (n1 !== n2);
        break;
        case "max":
            result = max(n1, n2);
        break;
        case "min":
            result = min(n1, n2);
        break;
        //boolean operators
        case "&&":
            result = (n1 && n2);
        break;
        case "||":
            result = (n1 || n2);
        break;
        case "!":
            result = !n1;
        break;
        //string operators, some of which are also array operators
        case "str_char":
        case "arr_elem":
            result = n1.at(n2);
        break;
        case "str_length":
        case "arr_length":
            result = n1.length;
        break;
        case "str_concat_front":
            result = n2 + n1;
        case "str_slice":
            result = n1.slice(n2, additional[0]);
        break;
        case "str_substr":
            result = n1.substr(n2, additional[0]);
        break;
        case "str_replace":
            result = n1.replace(n2, additional[0]);
        break;
        case "str_indexOf":
        case "arr_indexOf":
            result = n1.indexOf(n2);
        break;
        case "str_lastIndexOf":
        case "arr_lastIndexOf":
            result = n1.lastIndexOf(n2);
        break;
        case "str_indexOfFrom":
        case "arr_indexOfFrom":
            result = n1.indexOf(n2, additional[0]);
        break;
        case "str_lastIndexOfFrom":
        case "arr_lastIndexOfFrom":
            result = n1.lastIndexOf(n2, additional[0]);
        break;
        case "str_includes":
        case "arr_includes":
            result = n1.includes(n2);
        break;
        case "str_splice":
            result = string_splice(n1, n2, additional[0], additional[1]);
        break;
        case "str_toUpperCase":
            result = n1.toUpperCase();
        break;
        case "str_toLowerCase":
            result = n1.toLowerCase();
        break;
        case "str_split":
            result = n1.split(n2);
        break;
        //Array operators
        case "arr_edit_elem":
            result = structuredClone(n1);
            result[n2] = additional[0];
        break;
        case "arr_push":
            result = structuredClone(n1);
            result.push(n2);
        break;
        case "arr_pop":
            result = structuredClone(n1);
            result.pop();
        break;
        case "arr_unshift":
            result = structuredClone(n1);
            result.unshift(n2);
        break;
        case "arr_shift":
            result = structuredClone(n1);
            result.shift();
        break;
        case "arr_concat":
            result = n1.concat(n2);
        break;
        case "arr_concat_front":
            result = n2.concat(n1);
        break;
        case "arr_flat":
            result = n1.flat(n2);
        break;
        case "arr_splice":
            result = structuredClone(n1);
            result.splice(n2, additional[0], ...(additional[1]));
        break;
        case "arr_slice":
            result = n1.slice(n2, additional[0]);
        break;
        case "arr_reverse":
            result = n1.reverse();
        break;
        case "arr_sort":
            result = n1.sort(
                function(a, b) {
                    let nn2 = structuredClone(n2);
                    let vpos = 0;
                    if (nn2[0] == "@var_retain" || nn2[0] == "@var_copy") vpos = 1;
                    if (nn2.indexOf("@end_vars") == -1) nn2.splice(vpos, 0, "@end_vars");
                    vpos = nn2.indexOf("@end_vars");
                    nn2.splice(vpos, 0, a, b);
                    return CalcArray(nn2, ...additional[0]);
                }
            )
        break;
        case "arr_map":
            result = n1.map(
                function(value, index) {
                    let nn2 = structuredClone(n2);
                    let vpos = 0;
                    if (nn2[0] == "@var_retain" || nn2[0] == "@var_copy") vpos = 1;
                    if (nn2.indexOf("@end_vars") == -1) nn2.splice(vpos, 0, "@end_vars");
                    vpos = nn2.indexOf("@end_vars");
                    nn2.splice(vpos, 0, index, value);
                    return CalcArray(nn2, ...additional[0]);
                }
            )
        break;
        case "arr_reduce":
            result = n1.reduce(
                function(total, value, index) {
                    if (Array.isArray(total)) total.unshift("@Literal");
                    if (Array.isArray(value)) value.unshift("@Literal");
                    let nn2 = structuredClone(n2);
                    let vpos = 0;
                    if (nn2[0] == "@var_retain" || nn2[0] == "@var_copy") vpos = 1;
                    if (nn2.indexOf("@end_vars") == -1) nn2.splice(vpos, 0, "@end_vars");
                    vpos = nn2.indexOf("@end_vars");
                    nn2.splice(vpos + 1, 0, total);
                    nn2.splice(vpos, 0, index, value);
                    return CalcArray(nn2, ...additional[0]);
                }, additional[1]
            )
        break;
        case "arr_reduceRight":
            result = n1.reduceRight(
                function(total, value, index) {
                    let nn2 = structuredClone(n2);
                    let vpos = 0;
                    if (nn2[0] == "@var_retain" || nn2[0] == "@var_copy") vpos = 1;
                    if (nn2.indexOf("@end_vars") == -1) nn2.splice(vpos, 0, "@end_vars");
                    vpos = nn2.indexOf("@end_vars");
                    nn2.splice(vpos + 1, 0, total);
                    nn2.splice(vpos, 0, index, value);
                    return CalcArray(nn2, ...additional[0]);
                }, additional[1]
            )
        break;
        //BigInt operators
        case "rootB":
            result = iroot(n1, n2);
        break;
        case "logB":
            result = ilog(n1, n2);
        break;
        case "floorB":
            result = n1/n2 * n2;
        break;
        case "ceilB":
        case "ceilingB":
            if (n1 % n2 == 0n) result = n1/n2 * n2;
            else result = (n1/n2 + 1n) * n2;
        break;
        case "rand_bigint":
            result = getRndBigInt(n1, n2);
        break;
        //CalcArray shenanigans
        case "CalcArray":
            result = CalcArray(n1, ...n2);
        break;
        case "CalcArrayParent":
            if (Array.isArray(n1)) n1.unshift("@Literal");
            let nn2 = structuredClone(n2);
            let vpos = 0;
            if (nn2[0] == "@var_retain" || nn2[0] == "@var_copy") vpos = 1;
            if (nn2.indexOf("@end_vars") == -1) nn2.splice(vpos, 0, "@end_vars");
            vpos = nn2.indexOf("@end_vars");
            nn2.splice(vpos + 1, 0, total);
            nn2.splice(vpos, 0, index, value);
            result = CalcArray(nn2, ...additional[0]);
        break;
        //Type conversions
        case "Number":
            result = Number(result);
            if (Number.isNaN(result)) result = 0;
        break;
        case "String":
            result = String(result);
        break;
        case "Boolean":
            result = Boolean(result);
        break;
        case "Array":
            result = [result];
        break;
        case "BigInt":
            try {result = BigInt(result);}
            catch {
                try {result = BigInt(Math.round(result));}
                catch {result = 0n;}
            }
        break;
        case "typeof":
            if (Array.isArray(result)) result = "array";
            else result = typeof result;
        break;
        //Leftover cases
        case "1st":
        case "first":
            result = n1;
        break;
        case "2nd":
        case "second":
            result = n2;
        break;
        case "@add_score":
            score += n2;
        break;
        case "ignore":
            //Does nothing; this is used for leaving comments in CalcArray expressions, and in particular leaving "@no-negative-sign" is how to prevent loadModifiers from trying to multiply an expression by -1 for auto-generated negative tiles
        break;
        case "output": //For testing purposes only
            output(n2);
            result = n1;
        break;
        default: result = n1;
    }
    return result;
}

function CalcArray(arr) {
    /*
    CalcArrays, in their most basic form, are something like [2, "+", 3, "*", 5]. The CalcArray function evaluates a CalcArray into its result, working from left
    to right: for example, [2, "+", 3, "*", 5] = [5, "*", 5] = 25. What makes these useful is that they can use properties of the tiles they're working with in
    TileTypes and MergeRules: for example, ["@This 0", "*", 2] evaluates to double the 0th number of that tile's internal representation, so for a 162 tile in 2187,
    which internally is a [4, 2] tile, ["@This 0", "*", 2] evaluates to 8. CalcArrays can work with numbers, strings, booleans, bigints, and other arrays -
    but avoid using the @ character in strings if you want to work with them as strings, as strings beginning with @ mean special things, as seen in CalcArrayString.
    With all the features that CalcArrays support, they're almost a miniature programming language...
    */
    let vcoord = 0; let hcoord = 0; let vdir = 0; let hdir = 0; let addInfo = [1, Infinity, 0]; let gri = Grid; let parents = []; let vars = []; let inner = true;
    if (arguments.length > 1) vcoord = arguments[1]; // If this CalcArray is basing itself at a certain tile (usually via "@This" or "@Next" strings), this is the vertical coordinate of that tile
    if (arguments.length > 2) hcoord = arguments[2]; // Horizontal coordinate
    if (arguments.length > 3) vdir = arguments[3]; // For MergeRules, this is the vertical movement magnitude of the direction being moved
    if (arguments.length > 4) hdir = arguments[4]; // Horizontal movement magnitude
    if (arguments.length > 5) addInfo = arguments[5]; // An array with two entries: the first is the length of the current merge, the second is the slide amount of the current direction
    if (arguments.length > 6) gri = arguments[6]; // If we're looking at a grid that isn't the regular Grid, this specifies what the grid is
    if (arguments.length > 7) parents = arguments[7]; // The last entry of parents is the first entry of the current CalcArray. The second-to-last entry of parents is the first entry of the CalcArray that the current CalcArray is contained in, and so on, up to the first entry of parents being the first entry of the outermost CalcArray.
    if (arguments.length > 8 && arr[0] === "@var_retain") vars = arguments[8]; // CalcArray expressions can store and manipulate internal variables. @var_retain tells the CalcArray to use the exact same variables (by reference, which works since they're stored in an array) as the parent CalcArray, @var_copy tells the CalcArray to use the same variables (by value) as the parent CalcArray
    else if (arguments.length > 8 && arr[0] === "@var_copy") vars = structuredClone(arguments[8]);
    if (arguments.length > 9) inner = arguments[9]; // If inner is true, then this counts as an inner CalcArray, so it adds to the parents array. This is set to false for things like repeats, ifs, and elses, since they call CalcArray despite not actually being inner arrays
    if ((typeof arr == "string")) return CalcArrayString(arr, vcoord, hcoord, vdir, hdir, addInfo, gri, parents, vars);
    if (!Array.isArray(arr)) return arr;
    let carr = structuredClone(arr);
    if (carr[0] === "@Literal") return CalcArrayConvert(carr, vcoord, hcoord, vdir, hdir, addInfo, gri, parents, vars);
    if (carr[0] === "@var_retain" || carr[0] === "@var_copy") carr.shift();
    if (carr[0] === "@include_gvars") { // Include the variables from game_vars as the first variables in this CalcArray
        let newvars = structuredClone(game_vars);
        for (let v = 0; v < newvars.length; v++) {
            newvars[v] = CalcArrayConvert(newvars[v], "=", vcoord, hcoord, vdir, hdir, addInfo, gri, parents, vars);
            if (Array.isArray(newvars[v])) newvars[v].unshift("@Literal");
            vars.push(newvars[v]);
        }
        carr.shift();
    }
    if (carr.indexOf("@end_vars") > -1) { // When a CalcArray includes variables, it uses "@end_vars" to mark where the list of variables ends and the actual expression to evaluate begins.
        let newvars = carr.slice(0, carr.indexOf("@end_vars"));
        for (let v = 0; v < newvars.length; v++) {
            newvars[v] = CalcArrayConvert(newvars[v], "=", vcoord, hcoord, vdir, hdir, addInfo, gri, parents, vars);
            if (Array.isArray(newvars[v])) newvars[v].unshift("@Literal");
            vars.push(newvars[v]);
        }
        carr.splice(0, carr.indexOf("@end_vars") + 1);
    }
    if (inner) {
        parents = structuredClone(parents);
        parents.push(carr[0]);
    }
    let n1 = 0;
    let n2 = 0;
    let additional_args = [];
    let operator = "";
    let to_pop = 2; // How many entries (starting from the 1st, since the 0th is where the result is) should be removed after an operation?
    let if_skipped = false; // Is set to true only right after an if or else_if's condition is false; this is used so the CalcArray knows when to look at elses and else_ifs.
    while (carr.length > 1) {
        if (Array.isArray(carr[1])) carr[1] = CalcArray(carr[1], vcoord, hcoord, vdir, hdir, addInfo, gri, parents, vars);
        operator = carr[1];
        n1 = CalcArrayConvert(carr[0], operator, vcoord, hcoord, vdir, hdir, addInfo, gri, parents, vars);
        if (Array.isArray(n1)) n1.unshift("@Literal");
        parents[parents.length - 1] = structuredClone(n1);
        if (Array.isArray(n1)) n1.shift("@Literal");
        additional_args = [];
        if (operator == "@repeat") { // Repeats the operations between the entry after "@repeat" and "@end-repeat". If the entry after "@repeat" is a number, that's how many times those operations are repeated (like a for loop); otherwise, it should be a CalcArray expression, and the repetition continues as long as that expression evaluates to true (like a while loop)
            if (typeof CalcArray(carr[2], vcoord, hcoord, vdir, hdir, addInfo, gri, parents, vars) == "number") carr[2] = CalcArray(carr[2], vcoord, hcoord, vdir, hdir, addInfo, gri, parents, vars);
            let nesting = 1;
            let position = 3;
            let nestarray = [];
            while (nesting > 0 && position < carr.length) {
                let entry = carr[position];
                nestarray.push(entry);
                if (entry == "@repeat") nesting++;
                else if (entry == "@end-repeat") nesting--;
                else if (entry == "end-stack") nesting = 0;
                if (nesting == 0) nestarray.pop;
                else position++;
            }
            while ((typeof carr[2] == "number" && carr[2] > 0) || (typeof carr[2] == "object" && CalcArray(carr[2], vcoord, hcoord, vdir, hdir, addInfo, gri, parents, vars) === true)) {
                let nestarray1 = structuredClone(nestarray);
                if (Array.isArray(n1)) n1.unshift("@Literal");
                nestarray1.unshift("@var_retain", n1);
                n1 = CalcArray(nestarray1, vcoord, hcoord, vdir, hdir, addInfo, gri, parents, vars, false);
                if (typeof carr[2] == "number") carr[2] -= 1;
            }
            to_pop = position;
        }
        else if (operator == "@if") { // The operations between the entry after "@if" and "@end_if" only occur if the entry after "@if" evaluates to true
            let nesting = 1;
            let position = 3;
            let nestarray = [];
            while (nesting > 0 && position < carr.length) {
                let entry = carr[position];
                nestarray.push(entry);
                if (entry == "@if") nesting++;
                else if (entry == "@end-if") nesting--;
                else if (entry == "end-stack") nesting = 0;
                if (nesting == 0) nestarray.pop;
                else position++;
            }
            if (CalcArray(carr[2], vcoord, hcoord, vdir, hdir, addInfo, gri, parents, vars) === true) {
                let nestarray1 = structuredClone(nestarray);
                if (Array.isArray(n1)) n1.unshift("@Literal");
                nestarray1.unshift("@var_retain", n1);
                n1 = CalcArray(nestarray1, vcoord, hcoord, vdir, hdir, addInfo, gri, parents, vars, false);
            }
            else if_skipped = true;
            to_pop = position;
        }
        else if (operator == "@else") { // The operations between "@else" and "@end-else" only occur if an "@if" or an "@else-if" was just skipped
            let nesting = 1;
            let position = 2;
            let nestarray = [];
            while (nesting > 0 && position < carr.length) {
                let entry = carr[position];
                nestarray.push(entry);
                if (entry == "@else") nesting++;
                else if (entry == "@end-else") nesting--;
                else if (entry == "end-stack") nesting = 0;
                if (nesting == 0) nestarray.pop;
                else position++;
            }
            if (if_skipped) {
                let nestarray1 = structuredClone(nestarray);
                if (Array.isArray(n1)) n1.unshift("@Literal");
                nestarray1.unshift("@var_retain", n1);
                n1 = CalcArray(nestarray1, vcoord, hcoord, vdir, hdir, addInfo, gri, parents, vars, false);
            }
            if_skipped = false;
            to_pop = position;
        }
        else if (operator == "@else-if") { // You can probably guess how this one works
            let nesting = 1;
            let position = 3;
            let nestarray = [];
            while (nesting > 0 && position < carr.length) {
                let entry = carr[position];
                nestarray.push(entry);
                if (entry == "@else-if") nesting++;
                else if (entry == "@end-else-if") nesting--;
                else if (entry == "end-stack") nesting = 0;
                if (nesting == 0) nestarray.pop;
                else position++;
            }
            if (if_skipped) {
                if (CalcArray(carr[2], vcoord, hcoord, vdir, hdir, addInfo, gri, parents, vars) === true) {
                    if_skipped = false;
                    let nestarray1 = structuredClone(nestarray);
                    if (Array.isArray(n1)) n1.unshift("@Literal");
                    nestarray1.unshift("@var_retain", n1);
                    n1 = CalcArray(nestarray1, vcoord, hcoord, vdir, hdir, addInfo, gri, parents, vars, false);
                }
                else if_skipped = true;
            }
            to_pop = position;
        }
        else if (operator == "@edit_var") { // The entry after "@edit_var" is which variable to edit, the entry after that is what to change that variable to
            let vlocation = 0;
            vlocation = CalcArrayConvert(carr[2], "+", vcoord, hcoord, vdir, hdir, addInfo, gri, parents, vars);
            n2 = CalcArrayConvert(carr[3], "=", vcoord, hcoord, vdir, hdir, addInfo, gri, parents, vars);
            if (Array.isArray(n2)) n2.unshift("@Literal");
            if (vlocation % 1 == 0 && vlocation >= 0 && vlocation < vars.length) vars[vlocation] = n2;
            else if (vlocation % 1 == 0 && vlocation < 0 && vlocation >= vars.length * -1) vars[vars.length - vlocation] = n2;
            to_pop = 3;
        }
        else if (operator == "@add_var") { // Adds a new variable at the end of the variables array
            n2 = CalcArrayConvert(carr[2], "=", vcoord, hcoord, vdir, hdir, addInfo, gri, parents, vars);
            if (Array.isArray(n2)) n2.unshift("@Literal");
            vars.push(n2);
            to_pop = 2;
        }
        else if (operator == "@insert_var") { // The entry after "@insert_var" is where to insert the new variable, the entry after that is the value of the new variable
            let vlocation = 0;
            vlocation = CalcArrayConvert(carr[2], "+", vcoord, hcoord, vdir, hdir, addInfo, gri, parents, vars);
            n2 = CalcArrayConvert(carr[3], "=", vcoord, hcoord, vdir, hdir, addInfo, gri, parents, vars);
            if (Array.isArray(n2)) n2.unshift("@Literal");
            vars.splice(vlocation, 0, n2);
            to_pop = 3;
        }
        else if (operator == "@remove_var") { // Removes the variable at the given position of the variables array
            let vlocation = 0;
            vlocation = CalcArrayConvert(carr[2], "+", vcoord, hcoord, vdir, hdir, addInfo, gri, parents, vars);
            vars.splice(vlocation, 1);
            to_pop = 2;
        }
        else if (operator == "@edit_gvar") { // These next four do the same thing as the previous four, but on game_vars instead of the internal variables
            let vlocation = 0;
            vlocation = CalcArrayConvert(carr[2], "+", vcoord, hcoord, vdir, hdir, addInfo, gri, parents, vars);
            n2 = CalcArrayConvert(carr[3], "=", vcoord, hcoord, vdir, hdir, addInfo, gri, parents, vars);
            if (Array.isArray(n2)) n2.unshift("@Literal");
            if (vlocation % 1 == 0 && vlocation >= 0 && vlocation < game_vars.length) game_vars[vlocation] = n2;
            else if (vlocation % 1 == 0 && vlocation < 0 && vlocation >= game_vars.length * -1) game_vars[game_vars.length - vlocation] = n2;
            to_pop = 3;
        }
        else if (operator == "@add_gvar") {
            n2 = CalcArrayConvert(carr[2], "=", vcoord, hcoord, vdir, hdir, addInfo, gri, parents, vars);
            if (Array.isArray(n2)) n2.unshift("@Literal");
            game_vars.push(n2);
            to_pop = 2;
        }
        else if (operator == "@insert_gvar") {
            let vlocation = 0;
            vlocation = CalcArrayConvert(carr[2], "+", vcoord, hcoord, vdir, hdir, addInfo, gri, parents, vars);
            n2 = CalcArrayConvert(carr[3], "=", vcoord, hcoord, vdir, hdir, addInfo, gri, parents, vars);
            if (Array.isArray(n2)) n2.unshift("@Literal");
            game_vars.splice(vlocation, 0, n2);
            to_pop = 3;
        }
        else if (operator == "@remove_gvar") {
            let vlocation = 0;
            vlocation = CalcArrayConvert(carr[2], "+", vcoord, hcoord, vdir, hdir, addInfo, gri, parents, vars);
            game_vars.splice(vlocation, 1);
            to_pop = 2;
        }
        else if (operator == "@edit_mvar") { // These four alter modifier_vars
            let vlocation = 0;
            vlocation = CalcArrayConvert(carr[2], "+", vcoord, hcoord, vdir, hdir, addInfo, gri, parents, vars);
            n2 = CalcArrayConvert(carr[3], "=", vcoord, hcoord, vdir, hdir, addInfo, gri, parents, vars);
            if (Array.isArray(n2)) n2.unshift("@Literal");
            if (vlocation % 1 == 0 && vlocation >= 0 && vlocation < modifier_vars.length) modifier_vars[vlocation] = n2;
            else if (vlocation % 1 == 0 && vlocation < 0 && vlocation >= modifier_vars.length * -1) modifier_vars[modifier_vars.length - vlocation] = n2;
            to_pop = 3;
        }
        else if (operator == "@add_mvar") {
            n2 = CalcArrayConvert(carr[2], "=", vcoord, hcoord, vdir, hdir, addInfo, gri, parents, vars);
            if (Array.isArray(n2)) n2.unshift("@Literal");
            modifier_vars.push(n2);
            to_pop = 2;
        }
        else if (operator == "@insert_mvar") {
            let vlocation = 0;
            vlocation = CalcArrayConvert(carr[2], "+", vcoord, hcoord, vdir, hdir, addInfo, gri, parents, vars);
            n2 = CalcArrayConvert(carr[3], "=", vcoord, hcoord, vdir, hdir, addInfo, gri, parents, vars);
            if (Array.isArray(n2)) n2.unshift("@Literal");
            modifier_vars.splice(vlocation, 0, n2);
            to_pop = 3;
        }
        else if (operator == "@remove_mvar") {
            let vlocation = 0;
            vlocation = CalcArrayConvert(carr[2], "+", vcoord, hcoord, vdir, hdir, addInfo, gri, parents, vars);
            modifier_vars.splice(vlocation, 1);
            to_pop = 2;
        }
        else if (operator == "@edit_spawn") { // These four alter the spawning tiles
            let vlocation = 0;
            vlocation = CalcArrayConvert(carr[2], "+", vcoord, hcoord, vdir, hdir, addInfo, gri, parents, vars);
            n2 = CalcArrayConvert(carr[3], "=", vcoord, hcoord, vdir, hdir, addInfo, gri, parents, vars);
            if (Array.isArray(n2)) n2.unshift("@Literal");
            if (vlocation % 1 == 0 && vlocation >= 0 && vlocation < TileSpawns.length) TileSpawns[vlocation] = n2;
            else if (vlocation % 1 == 0 && vlocation < 0 && vlocation >= TileSpawns.length * -1) TileSpawns[TileSpawns.length - vlocation] = n2;
            to_pop = 3;
        }
        else if (operator == "@add_spawn") {
            n2 = CalcArrayConvert(carr[2], "=", vcoord, hcoord, vdir, hdir, addInfo, gri, parents, vars);
            if (Array.isArray(n2)) n2.unshift("@Literal");
            TileSpawns.push(n2);
            to_pop = 2;
        }
        else if (operator == "@insert_spawn") {
            let vlocation = 0;
            vlocation = CalcArrayConvert(carr[2], "+", vcoord, hcoord, vdir, hdir, addInfo, gri, parents, vars);
            n2 = CalcArrayConvert(carr[3], "=", vcoord, hcoord, vdir, hdir, addInfo, gri, parents, vars);
            if (Array.isArray(n2)) n2.unshift("@Literal");
            TileSpawns.splice(vlocation, 0, n2);
            to_pop = 3;
        }
        else if (operator == "@remove_spawn") {
            let vlocation = 0;
            vlocation = CalcArrayConvert(carr[2], "+", vcoord, hcoord, vdir, hdir, addInfo, gri, parents, vars);
            TileSpawns.splice(vlocation, 1);
            to_pop = 2;
        }
        else if (operator == "@replace_tile") { // Changes a tile on the grid; the first two arguments are the coordinates of the tile, the third is the new value. The third argument can be any type so Empty and Void are accessible
            if (currentScreen == "Gameplay") {
                let rvcoord = CalcArrayConvert(carr[2], "+", vcoord, hcoord, vdir, hdir, addInfo, gri, parents, vars);
                let rhcoord = CalcArrayConvert(carr[3], "+", vcoord, hcoord, vdir, hdir, addInfo, gri, parents, vars);
                n2 = CalcArrayConvert(carr[4], "=", vcoord, hcoord, vdir, hdir, addInfo, gri, parents, vars);
                if (Array.isArray(n2)) n2.unshift("@Literal");
                Grid[rvcoord][rhcoord] = n2;
            }
            to_pop = 4;
        }
        else {
            if (pop_1_operators.indexOf(operator) > -1) {
                to_pop = 1;
                n2 = 0;
            }
            else if (operator == "str_char" || operator == "arr_elem" || operator == "@add_score") {
                to_pop = 2;
                n2 = CalcArrayConvert(carr[2], "+", vcoord, hcoord, vdir, hdir, addInfo, gri, parents, vars);
            }
            else if (operator == "str_slice" || operator == "str_substr" || operator == "str_splice" || operator == "arr_splice" || operator == "arr_slice") {
                to_pop = 3;
                n2 = CalcArrayConvert(carr[2], "+", vcoord, hcoord, vdir, hdir, addInfo, gri, parents, vars);
                additional_args.push(CalcArrayConvert(carr[3], "+", vcoord, hcoord, vdir, hdir, addInfo, gri, parents, vars));
                if (operator == "str_splice" || operator == "arr_splice") {
                    additional_args.push(CalcArrayConvert(carr[4], operator, vcoord, hcoord, vdir, hdir, addInfo, gri, parents, vars));
                }
            }
            else if (operator == "str_indexOfFrom" || operator == "str_lastIndexOfFrom" || operator == "arr_indexOfFrom" || operator == "arr_lastIndexOfFrom") {
                to_pop = 2;
                n2 = CalcArrayConvert(carr[2], operator, vcoord, hcoord, vdir, hdir, addInfo, gri, parents, vars);
                additional_args.push(CalcArrayConvert(carr[3], "+", vcoord, hcoord, vdir, hdir, addInfo, gri, parents, vars));
            }
            else if (operator == "arr_edit_elem") {
                to_pop = 2;
                n2 = CalcArrayConvert(carr[2], "+", vcoord, hcoord, vdir, hdir, addInfo, gri, parents, vars);
                additional_args.push(CalcArrayConvert(carr[3], "=", vcoord, hcoord, vdir, hdir, addInfo, gri, parents, vars));
            }
            else if (operator == "arr_push" || operator == "arr_unshift") {
                to_pop = 2;
                n2 = CalcArrayConvert(carr[2], "=", vcoord, hcoord, vdir, hdir, addInfo, gri, parents, vars);
            }
            else if (operator == "arr_sort" || operator == "arr_map" || operator == "CalcArrayParent") {
                to_pop = 2;
                n2 = carr[2]; //n2 is supposed to be a valid CalcArray expression which will be evaluated by the operation, so no conversion yet
                additional_args.push([vcoord, hcoord, vdir, hdir, addInfo, gri, parents, vars]); //The CalcArray in operation will need these
            }
            else if (operator == "arr_reduce" || operator == "arr_reduceRight") {
                to_pop = 3;
                n2 = carr[3]; //n2 is supposed to be a valid CalcArray expression which will be evaluated by the operation, so no conversion yet
                additional_args.push([vcoord, hcoord, vdir, hdir, addInfo, gri, parents, vars]); //The CalcArray in operation will need these
                additional_args.push(CalcArrayConvert(carr[2], "=", vcoord, hcoord, vdir, hdir, addInfo, gri, parents, vars)); //Initial value
            }
            else if (operator == "CalcArray") {
                to_pop = 1;
                n2 = [vcoord, hcoord, vdir, hdir, addInfo, gri, parents, vars]; //The CalcArray in operation will need these
            }
            else {
                to_pop = 2;
                n2 = CalcArrayConvert(carr[2], operator, vcoord, hcoord, vdir, hdir, addInfo, gri, parents, vars);
            }
            n1 = operation(n1, operator, n2, additional_args);
        }
        if (Array.isArray(n1)) n1.unshift("@Literal");
        carr[0] = n1;
        parents[parents.length - 1] = n1;
        carr.splice(1, to_pop);
    }
    carr[0] = CalcArrayConvert(carr[0], "=", vcoord, hcoord, vdir, hdir, addInfo, gri, parents, vars);
    return carr[0];
}

function CalcArrayConvert(input, operator) { // Converts the input into a type based on the operator
    let vcoord = 0; let hcoord = 0; let vdir = 0; let hdir = 0; let addInfo = [1, Infinity, 0]; let gri = Grid; let parents = []; let vars = [];
    if (arguments.length > 2) vcoord = arguments[2];
    if (arguments.length > 3) hcoord = arguments[3];
    if (arguments.length > 4) vdir = arguments[4];
    if (arguments.length > 5) hdir = arguments[5];
    if (arguments.length > 6) addInfo = arguments[6];
    if (arguments.length > 7) gri = arguments[7];
    if (arguments.length > 8) parents = arguments[8];
    if (arguments.length > 9) vars = arguments[9];
    let result = structuredClone(input);
    do {
        if (Array.isArray(result)) {
            if (result[0] === "@Literal") {
                // CalcArrays assume that any arrays within them are also CalcArray expressions (making array brackets act sort of like parentheses). To get a CalcArray expression to work with an array inside it as an actual array, you have to put "@Literal" as the 0th entry of the array. CalcArray and CalcArrayString will do the rest to ensure that array stays as an actual array that doesn't actually include that "@Literal".
                for (let c = 1; c < result.length; c++) {
                    if (Array.isArray(result[c])) {
                        if (result[c][0] === "@CalcArray") result[c] = CalcArray(result[c].slice(1), vcoord, hcoord, vdir, hdir, addInfo, gri, parents, vars); // Once you're in a literal array, the subarrays are considered literal to... unless their 0th entry is "@CalcArray", which indicates that, despite being inside a literal array, that subarray is to be evaluated as a CalcArray expression.
                        else {
                            result[c].unshift("@Literal");
                            result[c] = CalcArray(result[c], vcoord, hcoord, vdir, hdir, addInfo, gri, parents, vars);
                        }
                    }
                }
                result = result.slice(1);
            }
            else result = CalcArray(result, vcoord, hcoord, vdir, hdir, addInfo, gri, parents, vars);
        }
        if (any_operators.indexOf(operator) > -1) {
            if (typeof result == "string") result = CalcArrayString(result, vcoord, hcoord, vdir, hdir, addInfo, gri, parents, vars);
        }
        else if (number_operators.indexOf(operator) > -1) {
            if (typeof result == "string") result = CalcArrayString(result, vcoord, hcoord, vdir, hdir, addInfo, gri, parents, vars);
            result = Number(result);
            if (Number.isNaN(result)) result = 0;
        }
        else if (string_operators.indexOf(operator) > -1) {
            result = CalcArrayString(String(result), vcoord, hcoord, vdir, hdir, addInfo, gri, parents, vars);
        }
        else if (boolean_operators.indexOf(operator) > -1) {
            if (typeof result == "string") result = CalcArrayString(result, vcoord, hcoord, vdir, hdir, addInfo, gri, parents, vars);
            result = Boolean(result);
        }
        else if (array_operators.indexOf(operator) > -1) {
            if (typeof result == "string") result = CalcArrayString(result, vcoord, hcoord, vdir, hdir, addInfo, gri, parents, vars);
            if (!(Array.isArray(result))) result = [result];
        }
        else if (bigint_operators.indexOf(operator) > -1) {
            if (typeof result == "string") result = CalcArrayString(result, vcoord, hcoord, vdir, hdir, addInfo, gri, parents, vars);
            try {result = BigInt(result);}
            catch {
                try {result = BigInt(Math.round(result));}
                catch {result = 0n;}
            }
        }
    } while (Array.isArray(result) && result[0] === "@Literal")
    return result;
}

function CalcArrayString(str) {
    // CalcArrays treat strings with an @ as their 0th character specially: these strings are used to indicate things, most commonly one of the values of a tile.
    let vcoord = 0; let hcoord = 0; let vdir = 0; let hdir = 0; let addInfo = [1, Infinity, 0]; let gri = Grid; let parents = []; let vars = [];
    if (arguments.length > 1) vcoord = arguments[1];
    if (arguments.length > 2) hcoord = arguments[2];
    if (arguments.length > 3) vdir = arguments[3];
    if (arguments.length > 4) hdir = arguments[4];
    if (arguments.length > 5) addInfo = arguments[5];
    if (arguments.length > 6) gri = arguments[6];
    if (arguments.length > 7) parents = arguments[7];
    if (arguments.length > 8) vars = arguments[8];
    let result = str;
    if (str[0] != "@") return str;
    let split = str.split(" ");
    if (split.length < 3 && split[0] == "@This") { // "@This 0" refers to the 0th entry of the internal array of the tile being examined, "@This 1" is its first entry, and so on. "@This" without the number refers to the whole array of that tile.
        let gri_pos;
        if (vcoord == "None") gri_pos = gri;
        else if (hcoord == "None") gri_pos = gri[vcoord];
        else gri_pos = gri[vcoord][hcoord];
        if (split.length == 1) {
            result = structuredClone(gri_pos);
            result.unshift("@Literal");
        }
        else {
            let tnum = Number(split[1]);
            if (!(Number.isNaN(tnum)) && tnum % 1 == 0 && tnum >= 0 && tnum < TileNumAmount) {
                if (typeof gri_pos == "string") result = gri_pos;
                else result = gri_pos[tnum];
            }
            else return str;
        }
    }
    else if (split.length < 5 && split[0] == "@Next") { // "@Next 1 0" is the 0th entry of the first "next" tile: if the movement direction is 1 tile to the left, then "@Next 1 0" is the 0th entry of the tile that's one tile to the left of the tile being examined. Primarily used in merge rules. "@Next 1" returns the entire first next tile, "@Next" returns all of the next tiles within the merge length.
        if (split.length == 1) {
            let nextv = vcoord + vdir;
            let nexth = hcoord + hdir;
            result = [];
            let tile = [];
            for (let t = 1; t < addInfo[0]; t++) {
                if (!(!(Number.isNaN(nextv)) && nextv % 1 == 0 && nextv >= 0 && nextv < height) || !(!(Number.isNaN(nexth)) && nexth % 1 == 0 && nexth >= 0 && nexth < width)) break;
                tile = structuredClone(gri[nextv][nexth]);
                result.unshift(tile);
                nextv += vdir;
                nexth += hdir;
            }
            result.unshift("@Literal");
        }
        else {
            let nextv = vcoord + vdir * Number(split[1]);
            let nexth = hcoord + hdir * Number(split[1]);
            if (split.length == 2) {
                if (!(!(Number.isNaN(nextv)) && nextv % 1 == 0 && nextv >= 0 && nextv < height) || !(!(Number.isNaN(nexth)) && nexth % 1 == 0 && nexth >= 0 && nexth < width)) return false;
                result = structuredClone(gri[nextv][nexth]);
                if (Array.isArray(result)) result.unshift("@Literal");
            }
            else {
                let tnum = Number(split[2]);
                if (!(!(Number.isNaN(tnum)) && tnum % 1 == 0 && tnum >= 0 && tnum < TileNumAmount)) return str;
                if (split.length == 4) {
                    tnum = Number(split[3]);
                    if (!(!(Number.isNaN(tnum)) && tnum % 1 == 0 && tnum >= 0 && tnum < TileNumAmount)) return str;
                    nextv += hdir * Number(split[2]);
                    nexth += -vdir * Number(split[2]);
                }
                if (!(!(Number.isNaN(nextv)) && nextv % 1 == 0 && nextv >= 0 && nextv < height) || !(!(Number.isNaN(nexth)) && nexth % 1 == 0 && nexth >= 0 && nexth < width)) return false;
                if (typeof gri[nextv][nexth] == "string") result = gri[nextv][nexth];
                else result = gri[nextv][nexth][tnum];
            }
        }
    }
    else if (split.length < 4 && (split[0] == "@NextNE" || split[0] == "@NextFull")) { // "@NextNE 1 0" is like "@Next 1 0", but it skips over empty tiles. @NextFull skips over both empty and void tiles. Most commonly used for the purposes of using "@NextNE -1 0" to refer to the next non-empty tile BEHIND the current tile, such as preventing a two-tile merge if the tile behind the current tile would cause a three-tile merge, allowing the three-tile merge to take priority.
        let nextv = vcoord;
        let nexth = hcoord;
        let tiles_found = 0;
        while (tiles_found < Math.abs(split[1])) {
            if (split[1] < 0) {
                nextv -= vdir;
                nexth -= hdir;
            }
            else {
                nextv += vdir;
                nexth += hdir;
            }
            if (!(!(Number.isNaN(nextv)) && nextv % 1 == 0 && nextv >= 0 && nextv < height) || !(!(Number.isNaN(nexth)) && nexth % 1 == 0 && nexth >= 0 && nexth < width)) return false;
            if (gri[nextv][nexth] != "@Empty" && (gri[nextv][nexth] != "@Void" || split[0] == "@NextNE")) tiles_found++;
        }
        if (split.length == 2) {
            if (!(!(Number.isNaN(nextv)) && nextv % 1 == 0 && nextv >= 0 && nextv < height) || !(!(Number.isNaN(nexth)) && nexth % 1 == 0 && nexth >= 0 && nexth < width)) return false;
            result = structuredClone(gri[nextv][nexth]);
            if (Array.isArray(result)) result.unshift("@Literal");
        }
        else {
            let tnum = Number(split[2]);
            if (!(!(Number.isNaN(tnum)) && tnum % 1 == 0 && tnum >= 0 && tnum < TileNumAmount)) return str;
            if (typeof gri[nextv][nexth] == "string") result = gri[nextv][nexth];
            else result = gri[nextv][nexth][tnum];
        }
    }
    else if (split.length < 5 && split[0] == "@Relative") { // "@Relative -3 1 2" is the 2nd entry of the tile that's 3 spaces up and 1 space to the right of the current tile
        let nextv = vcoord + Number(split[1]);
        let nexth = hcoord + Number(split[2]);
        if (!(!(Number.isNaN(nextv)) && nextv % 1 == 0 && nextv >= 0 && nextv < height) || !(!(Number.isNaN(nexth)) && nexth % 1 == 0 && nexth >= 0 && nexth < width)) return str;
        if (split.length == 3) {
            result = structuredClone(gri[nextv][nexth]);
            if (Array.isArray(result)) result.unshift("@Literal");
        }
        else {
            let tnum = Number(split[3]);
            if (!(!(Number.isNaN(tnum)) && tnum % 1 == 0 && tnum >= 0 && tnum < TileNumAmount)) return str;
            if (typeof gri[nextv][nexth] == "string") result = gri[nextv][nexth];
            else result = gri[nextv][nexth][tnum];
        }
    }
    else if (split[0] == "@Grid") { // "@Grid 1 2 0" is the 0th entry of the tile in position [1, 2]. "@Grid 3 5" is the whole tile at position [3, 5], "@Grid 2" is the entire 2nd row of the grid, and "@Grid" is the whole grid, which is an array (grid) of arrays (rows) of arrays (tiles).
        result = Grid;
        for (let t = 1; t < split.length; t++) {
            if (!(Array.isArray(result))) break;
            let sn = Number(split[t]);
            if (!(!(Number.isNaN(sn)) && sn % 1 == 0 && sn >= 0)) break;
            if (result[sn] == undefined) break;
            result = result[sn];
        }
        result = structuredClone(result);
        if (Array.isArray(result)) result.unshift("@Literal");
    }
    else if (split.length == 1 && split[0] == "@VCoord") { // Vertical coordinate of the current tile
        result = vcoord;
    }
    else if (split.length == 1 && split[0] == "@HCoord") { // Horizontal coordinate of the current tile
        result = hcoord;
    }
    else if (split.length == 1 && split[0] == "@VDir") { // Vertical movement magnitude
        result = vdir;
    }
    else if (split.length == 1 && split[0] == "@HDir") { // Horizontal movement magnitude
        result = hdir;
    }
    else if (split.length == 1 && split[0] == "@MLength") { // Length of the current merge
        result = addInfo[0];
    }
    else if (split.length == 1 && split[0] == "@SlideAmount") { // Slide amount of the movement direction
        result = addInfo[1];
    }
    else if (split.length == 1 && split[0] == "@MoveType") { // Move type of the movement direction
        result = addInfo[2];
    }
    else if (split.length < 3 && split[0] == "@Parent") {  // "@Parent 0" is the first entry of the outermost CalcArray, "@Parent 1" is the first entry of the second-to-outermost CalcArray (that contains the current CalcArray), and so on. Uses .at for negative indices, so "@Parent -1" is the last entry of parents, i.e. the first entry of the current CalcArray.
        if (split.length == 1) result = parents.length;
        let tnum = Number(split[1]);
        let varn = parents.at(tnum);
        if (varn == undefined) return str;
        else result = CalcArray(varn, vcoord, hcoord, vdir, hdir, addInfo, gri, parents, vars);
    }
    else if (split.length < 3 && split[0] == "@Var") { // "@Var 0" is the 0th variable. Also uses .at for negative indices.
        if (split.length == 1) result = vars.length;
        else {
            let tnum = Number(split[1]);
            let varn = vars.at(tnum);
            if (varn == undefined) return str;
            else result = varn;
        }
    }
    else if (split.length < 3 && split[0] == "@GVar") { // Like @Var, but for game_vars
        if (split.length == 1) result = game_vars.length;
        else {
            let tnum = Number(split[1]);
            let varn = game_vars.at(tnum);
            if (varn == undefined) return str;
            else result = varn;
        }
    }
    else if (split.length < 3 && split[0] == "@MVar") { // Like @Var, but for modifier_vars
        if (split.length == 1) result = modifier_vars.length;
        else {
            let tnum = Number(split[1]);
            let varn = modifier_vars.at(tnum);
            if (varn == undefined) return str;
            else result = varn;
        }
    }
    else if (split.length == 1 && split[0] == "@Score") {
        result = score;
    }
    else if (split.length == 1 && split[0] == "@Moves") {
        result = moves_so_far;
    }
    else if (split.length == 1 && split[0] == "@Merges") {
        result = merges_so_far;
    }
    else if (split.length == 1 && split[0] == "@MergeMoves") {
        result = moves_where_merged;
    }
    else if (split.length == 1 && split[0] == "@MergesBefore") {
        result = merges_before_now;
    }
    else if (split[0] == "@DiscTiles") { // "@DiscTiles 0" is the 0th discovered tile this game, "@DiscTiles 1 2" is the 2nd entry of the 1st discovered tile this game, and "@DiscTiles" is the whole array of discovered tiles
        result = discoveredTiles;
        for (let t = 1; t < split.length; t++) {
            if (!(Array.isArray(result))) break;
            let sn = Number(split[t]);
            if (!(!(Number.isNaN(sn)) && sn % 1 == 0 && sn >= 0)) break;
            if (result[sn] == undefined) break;
            result = result[sn];
        }
        result = structuredClone(result);
        if (Array.isArray(result)) result.unshift("@Literal");
    }
    else if (split[0] == "@DiscWinning") { // Like @DiscTiles, but only including the tiles that are included in the win conditions
        result = discoveredWinning;
        for (let t = 1; t < split.length; t++) {
            if (!(Array.isArray(result))) break;
            let sn = Number(split[t]);
            if (!(!(Number.isNaN(sn)) && sn % 1 == 0 && sn >= 0)) break;
            if (result[sn] == undefined) break;
            result = result[sn];
        }
        result = structuredClone(result);
        if (Array.isArray(result)) result.unshift("@Literal");
    }
    else if (split[0] == "@DiscLosing") { // Like @DiscTiles, but only including the tiles that are included in the loss conditions
        result = discoveredLosing;
        for (let t = 1; t < split.length; t++) {
            if (!(Array.isArray(result))) break;
            let sn = Number(split[t]);
            if (!(!(Number.isNaN(sn)) && sn % 1 == 0 && sn >= 0)) break;
            if (result[sn] == undefined) break;
            result = result[sn];
        }
        result = structuredClone(result);
        if (Array.isArray(result)) result.unshift("@Literal");
    }
    else if (split[0] == "@NextSpawns") { // "@NextSpawns 0" is the next tile to spawn, "@NextSpawns 3 4" is the 4th entry of the 3rd tile to spawn after the next one
        result = spawnConveyor;
        for (let t = 1; t < split.length; t++) {
            if (!(Array.isArray(result))) break;
            let sn = Number(split[t]);
            if (!(!(Number.isNaN(sn)) && sn % 1 == 0 && sn >= 0)) break;
            if (result[sn] == undefined) break;
            result = result[sn];
        }
        result = structuredClone(result);
        if (Array.isArray(result)) result.unshift("@Literal");
    }
    else return str;
    return structuredClone(result);
}

function calcArrayReorder(arr, order) { // Changes which tiles the "@Next" strings target in accordance with the 7th entry of a MergeRule
    let vdir = 0; let hdir = 0;
    if (arguments.length > 2) vdir = arguments[2];
    if (arguments.length > 3) hdir = arguments[3];
    let carr = structuredClone(arr);
    for (let e = 0; e < carr.length; e++) {
        let elem = carr[e];
        if (Array.isArray(elem)) elem = calcArrayReorder(elem, order, vdir, hdir);
        else if (typeof elem == "string" && elem[0] == "@") {
            let split = elem.split(" ");
            if (split.length == 2 && split[0] == "@This") {
                if (order[0] == 0) elem = "@This " + split[1];
                else elem = "@Next " + order[0] + " " + split[1];
            }
            else if (split.length == 3 && (split[0] == "@Next" || split[0] == "@NextNE") && split[1] >= 0) {
                let position = split[1];
                elem = split[0] + " " + order[position] + " " + split[2];
            }
            else if (split.length == 4 && split[0] == "@Relative") {
                elem = "@Relative " + (split[1] + vdir * order[0]) + " " + (split[2] + hdir * order[0]) + " " + split[3];
            }
        }
        carr[e] = elem; //Not sure why this line is needed, but it is.
    }
    return carr;
}

function evaluateColor(color) {
    /*
    Colors can appear in several forms in TileTypes: as a string like #f938ac, or as an array such as ["@RGBA", 255, 40, 20, 1]
    (which can come in RGBA, HSLA, or HSVA forms), and there can be gradients, which are arrays with each entry being either a color or a position in the gradient.
    */
    let vcoord = 0; let hcoord = 0; let gri = Grid; let vars = [];
    if (arguments.length > 1) vcoord = arguments[1];
    if (arguments.length > 2) hcoord = arguments[2];
    if (arguments.length > 3) gri = arguments[3];
    if (arguments.length > 4 && color[0] === "@var_retain") vars = arguments[4];
    else if (arguments.length > 4 && color[0] === "@var_copy") vars = structuredClone(arguments[4]);
    color = structuredClone(color);
    if (!(Array.isArray(color))) return color;
    if (color[0] === "@CalcArray") {
        color = CalcArray(color.slice(1), vcoord, hcoord, 0, 0, [1, Infinity, 0], gri, [], vars);
    }
    if (color[0] === "@var_copy" || color[0] === "@var_retain") color.shift();
    if (color[0] === "@include_gvars") {
        let newvars = structuredClone(game_vars);
        for (let v = 0; v < newvars.length; v++) {
            newvars[v] = CalcArrayConvert(newvars[v], "=", vcoord, hcoord, 0, 0, [1, Infinity, 0], gri, [], vars);
            if (Array.isArray(newvars[v])) newvars[v].unshift("@Literal");
            vars.push(newvars[v]);
        }
        color.shift();
    }
    if (color.indexOf("@end_vars") > -1) {
        let newvars = color.slice(0, color.indexOf("@end_vars"));
        for (let v = 0; v < newvars.length; v++) {
            newvars[v] = CalcArrayConvert(newvars[v], "=", vcoord, hcoord, 0, 0, [1, Infinity, 0], gri, [], vars);
            if (Array.isArray(newvars[v])) newvars[v].unshift("@Literal");
            vars.push(newvars[v]);
        }
        color.splice(0, color.indexOf("@end_vars") + 1);
    }
    if (color[0] === "@HSLA") {
        let hue = CalcArray(color[1], vcoord, hcoord, 0, 0, [1, Infinity, 0], gri, [], vars);
        let saturation = CalcArray(color[2], vcoord, hcoord, 0, 0, [1, Infinity, 0], gri, [], vars);
        let brightness = CalcArray(color[3], vcoord, hcoord, 0, 0, [1, Infinity, 0], gri, [], vars);
        let alpha = CalcArray(color[4], vcoord, hcoord, 0, 0, [1, Infinity, 0], gri, [], vars);
        return "hsla(" + hue + ", " + saturation + "%, " + brightness + "%, " + alpha + ")";
    }
    else if (color[0] === "@HSVA") { //HSV to HSL conversion found on Wikipedia
        let hue = CalcArray(color[1], vcoord, hcoord, 0, 0, [1, Infinity, 0], gri, [], vars);
        let HSVsaturation = CalcArray(color[2], vcoord, hcoord, 0, 0, [1, Infinity, 0], gri, [], vars) / 100;
        let HSVvalue = CalcArray(color[3], vcoord, hcoord, 0, 0, [1, Infinity, 0], gri, [], vars) / 100;
        let brightness = HSVvalue * (1 - (HSVsaturation / 2));
        let saturation = 0;
        if (!(brightness == 0 || brightness == 1)) saturation = (HSVvalue - brightness)/Math.min(brightness, 1 - brightness);
        brightness *= 100; saturation *= 100;
        let alpha = CalcArray(color[4], vcoord, hcoord, 0, 0, [1, Infinity, 0], gri, [], vars);
        return "hsla(" + hue + ", " + saturation + "%, " + brightness + "%, " + alpha + ")"
    }
    else if (color[0] === "@RGBA") {
        let red = CalcArray(color[1], vcoord, hcoord, 0, 0, [1, Infinity, 0], gri, [], vars);
        let green = CalcArray(color[2], vcoord, hcoord, 0, 0, [1, Infinity, 0], gri, [], vars);
        let blue = CalcArray(color[3], vcoord, hcoord, 0, 0, [1, Infinity, 0], gri, [], vars);
        let alpha = CalcArray(color[4], vcoord, hcoord, 0, 0, [1, Infinity, 0], gri, [], vars);
        return "rgba(" + red + ", " + green + ", " + blue+ ", " + alpha + ")"
    }
    else if (color[0] === "@linear-gradient" || color[0] === "@radial-gradient" || color[0] === "@conic-gradient" || color[0] === "@repeating-linear-gradient" || color[0] === "@repeating-radial-gradient" || color[0] === "@repeating-conic-gradient") {
        let grad = color[0].slice(1) + "("
        let i = 1;
        while (i < color.length) {
            if (typeof color[i] == "number") { // Strings and arrays in a gradient array represent colors, but numbers represent positions in the gradient...
                if (i == 1) { // ...unless it's the very first entry after the type of gradient, in which case it's the angle of the gradient.
                    grad += color[i];
                    grad += "deg";
                }
                else {
                    grad += " ";
                    grad += color[i];
                    if (color[0] == "@conic-gradient" || color[0] == "@repeating-conic-gradient") grad += "deg";
                    else grad += "%";
                }
            }
            else {
                if (i > 1) grad += ", ";
                grad += evaluateColor(color[i], vcoord, hcoord, gri, vars);
            }
            i++;
        }
        grad += ")";
        return grad;
    }
    else if (color[0] === "@multi-gradient") { // Now each entry is itself a gradient, with multiple gradients stacked
        let result = "";
        let i = 1;
        while (i < color.length) {
            result += evaluateColor(color[i], vcoord, hcoord, gri, vars);
            if (i < color.length - 1) result += ", ";
            i++;
        }
        return result;
    }
    else if (color[0] === "@rotate") {
        let rotated = rotateColor(color[3], color[1], color[2], vcoord, hcoord, gri);
        return evaluateColor(rotated, vcoord, hcoord, gri, vars);
    }
    else return CalcArray(color, vcoord, hcoord, 0, 0, [1, Infinity, 0], gri, [], vars);
}

function convertColor(col, system) { // Converts colors between systems; mostly useful because rotateColor prefers HSLA colors
    let vcoord = 0; let hcoord = 0; let gri = Grid;
    if (arguments.length > 2) vcoord = arguments[2];
    if (arguments.length > 3) hcoord = arguments[3];
    if (arguments.length > 4) gri = arguments[4];
    let color = structuredClone(col);
    if (Array.isArray(color) && (color[0] == "@linear-gradient" || color[0] == "@radial-gradient" || color[0] == "@conic-gradient" || color[0] == "@multi-gradient")) {
        for (let i = 1; i < color.length; i++) {
            if (Array.isArray(color[i]) || (typeof color[i] == "string" && color[i][0] == "#")) color[i] = convertColor(color[i], system, vcoord, hcoord, gri);
        }
        return color;
    }
    else {
        let colorarray = [];
        if (Array.isArray(color) && (color[0] == "@RGBA" || color[0] == "@HSLA" || color[0] == "@HSVA")) colorarray = color;
        else if (typeof color == "string" && color[0] == "#") { //Any hex colors are converted to RGBA arrays first
            if (color.length == 7 || color.length == 9) {
                let red = parseInt((color[1] + color[2]), 16);
                let green = parseInt((color[3] + color[4]), 16);
                let blue = parseInt((color[5] + color[6]), 16);
                let alpha = 1;
                if (color.length == 9) alpha = parseInt((color[7] + color[8]), 16)/255;
                colorarray = ["@RGBA", red, green, blue, alpha];
            }
            else if (color.length == 4 || color.length == 5) {
                let red = parseInt((color[1] + color[1]), 16);
                let green = parseInt((color[2] + color[2]), 16);
                let blue = parseInt((color[3] + color[3]), 16);
                let alpha = 1;
                if (color.length == 5) alpha = parseInt((color[4] + color[4]), 16)/255;
                colorarray = ["@RGBA", red, green, blue, alpha];
            }
        }
        if (Array.isArray(colorarray) && (colorarray[0] == "@RGBA" || colorarray[0] == "@HSLA" || colorarray[0] == "@HSVA")) {
            let e1 = CalcArray(colorarray[1], vcoord, hcoord, 0, 0, [1, Infinity, 0], gri);
            let e2 = CalcArray(colorarray[2], vcoord, hcoord, 0, 0, [1, Infinity, 0], gri);
            let e3 = CalcArray(colorarray[3], vcoord, hcoord, 0, 0, [1, Infinity, 0], gri);
            let e4 = CalcArray(colorarray[4], vcoord, hcoord, 0, 0, [1, Infinity, 0], gri);
            //Conversion formulas are from the subpages of https://www.rapidtables.com/convert/color/
            if (colorarray[0] == "@RGBA" && system == "@HSLA") {
                let rprime = e1 / 255;
                let gprime = e2 / 255;
                let bprime = e3 / 255;
                let cmax = Math.max(rprime, gprime, bprime);
                let cmin = Math.min(rprime, gprime, bprime);
                let delta = cmax - cmin;
                let hue = 0;
                let saturation = 0;
                let lightness = (cmax + cmin) / 2;
                if (delta != 0) {
                    saturation = delta / (1 - Math.abs(lightness * 2 - 1));
                    if (cmax == rprime) hue = 60 * (((gprime - bprime) / delta + 6) % 6);
                    else if (cmax == gprime) hue = 60 * (((bprime - rprime) / delta) + 2);
                    else if (cmax == bprime) hue = 60 * (((rprime - gprime) / delta) + 4);
                }
                colorarray = ["@HSLA", hue, saturation * 100, lightness * 100, e4];
            }
            else if (colorarray[0] == "@RGBA" && system == "@HSVA") {
                let rprime = e1 / 255;
                let gprime = e2 / 255;
                let bprime = e3 / 255;
                let cmax = Math.max(rprime, gprime, bprime);
                let cmin = Math.min(rprime, gprime, bprime);
                let delta = cmax - cmin;
                let hue = 0;
                let saturation = 0;
                let value = cmax;
                if (delta != 0) {
                    saturation = delta / cmax;
                    if (cmax == rprime) hue = 60 * (((gprime - bprime) / delta + 6) % 6);
                    else if (cmax == gprime) hue = 60 * (((bprime - rprime) / delta) + 2);
                    else if (cmax == bprime) hue = 60 * (((rprime - gprime) / delta) + 4);
                }
                colorarray = ["@HSVA", hue, saturation * 100, value * 100, e4];
            }
            else if (colorarray[0] == "@HSLA" && system == "@RGBA") {
                let hue = mod(e1, 360);
                let saturation = e2 / 100;
                let lightness = e3 / 100;
                let c = saturation * (1 - Math.abs(2 * lightness - 1));
                let x = c * (1 - Math.abs(((hue / 60) % 2) - 1))
                let m = lightness - c/2;
                let r = 0; let g = 0; let b = 0;
                if (hue >= 0 && hue < 60) {r = c; g = x;}
                else if (hue >= 60 && hue < 120) {r = x; g = c;}
                else if (hue >= 120 && hue < 180) {b = x; g = c;}
                else if (hue >= 180 && hue < 240) {b = c; g = x;}
                else if (hue >= 240 && hue < 300) {b = c; r = x;}
                else if (hue >= 300 && hue < 360) {b = x; r = c;}
                colorarray = ["@RGBA", 255 * (r + m), 255 * (g + m), 255 * (b + m), e4];
            }
            else if (colorarray[0] == "@HSLA" && system == "@HSVA") {
                let hue = mod(e1, 360);
                let saturationL = e2 / 100;
                let lightness = e3 / 100;
                let value = lightness + saturationL * Math.min(lightness, 1 - lightness);
                let saturationV = 0;
                if (value != 0) saturationV = 2 * (1 - lightness/value);
                colorarray = ["@HSVA", hue, saturationV * 100, value * 100, e4];
            }
            else if (colorarray[0] == "@HSVA" && system == "@RGBA") {
                let hue = mod(e1, 360);
                let saturation = e2 / 100;
                let value = e3 / 100;
                let c = value * saturation;
                let x = c * (1 - Math.abs(((hue / 60) % 2) - 1))
                let m = value - c;
                let r = 0; let g = 0; let b = 0;
                if (hue >= 0 && hue < 60) {r = c; g = x;}
                else if (hue >= 60 && hue < 120) {r = x; g = c;}
                else if (hue >= 120 && hue < 180) {b = x; g = c;}
                else if (hue >= 180 && hue < 240) {b = c; g = x;}
                else if (hue >= 240 && hue < 300) {b = c; r = x;}
                else if (hue >= 300 && hue < 360) {b = x; r = c;}
                colorarray = ["@RGBA", 255 * (r + m), 255 * (g + m), 255 * (b + m), e4];
            }
            else if (colorarray[0] == "@HSVA" && system == "@HSLA") {
                let hue = mod(e1, 360);
                let saturationV = e2 / 100;
                let value = e3 / 100;
                let lightness = value * (1 - saturationV / 2);
                let saturationL = 0;
                if (lightness % 1 != 0) saturationL = (value - lightness)/Math.min(lightness, 1 - lightness);
                colorarray = ["@HSLA", hue, saturationL * 100, lightness * 100, e4];
            }
            else colorarray = [colorarray[0], e1, e2, e3, e4];
        }
        return colorarray;
    }
}

function rotateColor(color, degrees) { //degrees = 180 gives the complementary color
    let invertL = false; let vcoord = 0; let hcoord = 0; let gri = Grid;
    if (arguments.length > 2) invertL = arguments[2]; // If this is true, then the lightness of the color is inverted
    if (arguments.length > 3) vcoord = arguments[3];
    if (arguments.length > 4) hcoord = arguments[4];
    if (arguments.length > 5) gri = arguments[5];
    let colorcopy = structuredClone(color);
    if (Array.isArray(color) && (color[0] == "@linear-gradient" || color[0] == "@radial-gradient" || color[0] == "@conic-gradient" || color[0] == "@multi-gradient")) {
        for (let i = 1; i < color.length; i++) {
            if (Array.isArray(colorcopy[i]) || (typeof colorcopy[i] == "string" && colorcopy[i][0] == "#")) colorcopy[i] = rotateColor(colorcopy[i], degrees, invertL, vcoord, hcoord, gri);
        }
        return colorcopy;
    }
    else {
        colorcopy = convertColor(colorcopy, "@HSLA", vcoord, hcoord, gri);
        colorcopy[1] += degrees;
        if (invertL) colorcopy[3] = 100 - colorcopy[3];
        return colorcopy;
    }
}

function evaluateMergeRule(rule) { // This does not actually evaluate whether a merge rule is currently applicable, it just turns the merge rule into a state such that CalcArray can do its job.
    let vcoord = 0; let hcoord = 0; let vdir = 0; let hdir = 0; let addInfo = [1, Infinity, 0]; let gri = Grid; let vars = [];
    if (arguments.length > 1) vcoord = arguments[1];
    if (arguments.length > 2) hcoord = arguments[2];
    if (arguments.length > 3) vdir = arguments[3];
    if (arguments.length > 4) hdir = arguments[4];
    if (arguments.length > 5) addInfo = arguments[5];
    if (arguments.length > 6) gri = arguments[6];
    if (arguments.length > 7 && rule[0] === "@var_retain") vars = arguments[7];
    else if (arguments.length > 7 && rule[0] === "@var_copy") vars = structuredClone(arguments[7]);
    let crule = structuredClone(rule);
    if (crule[0] === "@var_copy" || crule[0] === "@var_retain") crule.shift();
    if (crule[0] === "@include_gvars") {
        let newvars = structuredClone(game_vars);
        for (let v = 0; v < newvars.length; v++) {
            newvars[v] = CalcArrayConvert(newvars[v], "=", vcoord, hcoord, vdir, hdir, addInfo, gri, [], vars);
            if (Array.isArray(newvars[v])) newvars[v].unshift("@Literal");
            vars.push(newvars[v]);
        }
        crule.shift();
    }
    if (crule.indexOf("@end_vars") > -1) {
        let newvars = crule.slice(0, crule.indexOf("@end_vars"));
        for (let v = 0; v < newvars.length; v++) {
            newvars[v] = CalcArrayConvert(newvars[v], "=", vcoord, hcoord, vdir, hdir, addInfo, gri, [], vars);
            if (Array.isArray(newvars[v])) newvars[v].unshift("@Literal");
            vars.push(newvars[v]);
        }
        crule.splice(0, crule.indexOf("@end_vars") + 1);
    }
    let rlength = CalcArray(crule[0], vcoord, hcoord, vdir, hdir, addInfo, gri, [], vars);
    if (typeof rlength == "number") crule[0] = rlength;
    else crule[0] = 1;
    if (crule.length == 5 || crule[5].length == 0) {
        let mergeable = [];
        for (let i = 0; i < crule[3].length; i++) mergeable.push(false);
        for (let i = crule[3].length; i < rlength; i++) mergeable.push(true);
        if (crule.length == 5) crule.push(mergeable);
        else crule[5] = mergeable;
    }
    if (crule[0] == 0) {
        if (vars.length > 0) return vars.concat("@end_vars", crule);
        else return crule;
    }
    if (crule[3].indexOf("fill") > -1) {
        let fillArray = crule[3].slice(crule[3].indexOf("fill") + 1);
        crule[3] = crule[3].slice(0, crule[3].indexOf("fill"));
        let i = 0;
        while (crule[3].length < rlength) {
            crule[3].push(fillArray[i]);
            i++;
            if (i >= fillArray.length) i = 0;
        }
    }
    if (crule.length < 8) {
        if (vars.length > 0) return vars.concat("@end_vars", crule);
        else return crule;
    }
    if (crule[6] >= rlength) {
        if (vars.length > 0) return vars.concat("@end_vars", crule);
        else return crule;
    }
    let baserule = crule[1];
    let mergereqs = ["@var_retain", baserule];
    let entry = 0;
    while (crule[6] < rlength) {
        entry++;
        crule[6] += crule[8];
        mergereqs.push("&&");
        let orders = structuredClone(crule[7]);
        for (let e = 0; e < orders.length; e++) {
            orders[e] = CalcArray([orders[e], "*", entry, "+", e], vcoord, hcoord, vdir, hdir, [rlength, addInfo[1], addInfo[2]], gri, [], vars);
            if (typeof orders[e] != "number") orders[e] = e;
        }
        mergereqs.push(calcArrayReorder(baserule, orders));
    }
    crule[1] = mergereqs;
    if (vars.length > 0) return vars.concat("@end_vars", crule);
    else return crule;
}

//Gameplay
function refillSpawnConveyor() { // This function ensures that nextTiles is always full. spawnConveyor always has at least 1 tile in it, and it can have more if nextTiles is above 1.
    for (let s = 0; s < spawnConveyor.length; s++) {
        if (spawnConveyor[s] == "@Empty") {
            let weighttotal = 0;
            let cSpawns = structuredClone(TileSpawns);
            for (let p of cSpawns) {
                if (Array.isArray(p[1])) p[1] = CalcArray(p[1]);
                weighttotal += p[1]; // weighttotal is the sum of the spawn chances of each tile
            }
            let randnum = getRndInteger(1, weighttotal);
            let spawnedtile = "@Empty";
            let entry = 0;
            TileDecider: { // Chooses which tile we're spawning
                while (entry < cSpawns.length) {
                    randnum -= cSpawns[entry][1];
                    if (randnum <= 0) {
                        spawnedtile = structuredClone(cSpawns[entry][0]);
                        break TileDecider;
                    }
                    entry++;
                }
            }
            if (spawnedtile == "Box") { // If the tile we landed on is a spawn box, choose a tile from the box at random
                if (SpawnBoxes[entry].length == 0) refillSpawnBox(entry);
                let itemindex = getRndInteger(0, SpawnBoxes[entry].length - 1);
                spawnedtile = SpawnBoxes[entry][itemindex];
                SpawnBoxes[entry].splice(itemindex, 1);
                if (SpawnBoxes[entry].length == 0) refillSpawnBox(entry);
            }
            if (spawnedtile[0] == "@CalcArray") spawnedtile = CalcArray(spawnedtile.slice(1));
            if (Array.isArray(spawnedtile)) {
                for (let i = 0; i < spawnedtile.length; i++) {
                    if (Array.isArray(spawnedtile[i])) spawnedtile[i] = CalcArray(spawnedtile[i]); //If a spawned tile's entries are themselves arrays, assume those entries are CalcArray expressions
                }
            }
            spawnConveyor[s] = structuredClone(spawnedtile);
        }
    }
}

function spawnConveyorSelect() { // Takes the 0th entry of spawnConveyor and returns it, pushes the rest of the entries to the previous entry (thus closer to spawning), and refills the conveyor
    refillSpawnConveyor();
    let spawnedtile = structuredClone(spawnConveyor[0]);
    for (let s = 0; s < spawnConveyor.length - 1; s++) spawnConveyor[s] = structuredClone(spawnConveyor[s + 1]);
    spawnConveyor[spawnConveyor.length - 1] = "@Empty";
    refillSpawnConveyor();
    return spawnedtile;
}

function RandomTiles(amount, vdir, hdir) { // This is what spawns the random tiles. amount is the amount of tiles to spawn. vdir and hdir are the directions of the previous move, which we need if spawnLocation is Edge.
    let addInfo = [1, Infinity, 0];
    if (arguments.length > 3) addInfo = arguments[3];
    let TileChoices = [];
    let spawnedTiles = [];
    if (spawnLocation == "Edge" && (vdir != 0 || hdir != 0)) {
        let iterations = 0;
        let edgefound = false;
        Edge_Finder: {
            while (!edgefound) {
                if (vdir < 0 && hdir == 0) {
                    for (let column = 0; column < width; column++) {
                        TileChoices.push([height - 1 - iterations, column]);
                    }
                }
                else if (vdir > 0 && hdir == 0) {
                    for (let column = 0; column < width; column++) {
                        TileChoices.push([iterations, column]);
                    }
                }
                else if (vdir == 0 && hdir < 0) {
                    for (let row = 0; row < height; row++) {
                        TileChoices.push([row, width - 1 - iterations]);
                    }
                }
                else if (vdir == 0 && hdir > 0) {
                    for (let row = 0; row < height; row++) {
                        TileChoices.push([row, iterations]);
                    }
                }
                else if (vdir < 0 && hdir < 0) {
                    let row = height - 1 - iterations;
                    let column = width - 1;
                    for (let i = 0; i <= iterations; i++) {
                        TileChoices.push([row, column]);
                        row++;
                        column--;
                    }
                }
                else if (vdir > 0 && hdir < 0) {
                    let row = 0;
                    let column = width - 1 - iterations;
                    for (let i = 0; i <= iterations; i++) {
                        TileChoices.push([row, column]);
                        row++;
                        column++;
                    }
                }
                else if (vdir < 0 && hdir > 0) {
                    let row = height - 1 - iterations;
                    let column = 0;
                    for (let i = 0; i <= iterations; i++) {
                        TileChoices.push([row, column]);
                        row++;
                        column++;
                    }
                }
                else if (vdir > 0 && hdir > 0) {
                    let row = 0;
                    let column = iterations;
                    for (let i = 0; i <= iterations; i++) {
                        TileChoices.push([row, column]);
                        row++;
                        column--;
                    }
                }
                for (let t = 0; t < TileChoices.length; t++) {
                    if (Grid[TileChoices[t][0]][TileChoices[t][1]] != "@Void") {edgefound = true; break Edge_Finder;}
                }
                iterations++;
            }
        }
    }
    else {
        for (let row = 0; row < height; row++) {
            for (let column = 0; column < width; column++) {
                TileChoices.push([row, column]);
            }
        }
    }
    let spawned = 0;
    spawningRandomTiles: {
        while (spawned < amount && TileChoices.length > 0) {
            //Which tile is being spawned in?
            let found = false;
            let choice = 0;
            let row = 0;
            let column = 0;
            while (!found) {
                choice = getRndInteger(0, TileChoices.length - 1);
                row = TileChoices[choice][0];
                column = TileChoices[choice][1];
                if (Grid[row][column] == "@Empty") found = true;
                else {
                    TileChoices.splice(choice, 1);
                    if (TileChoices.length == 0) {
                        displayGrid();
                        break spawningRandomTiles;
                    }
                }
            }
            //What tile is spawning there?
            let spawnedtile = spawnConveyorSelect();
            //Do the spawning
            Grid[row][column] = structuredClone(spawnedtile);
            spawnedTiles.push(structuredClone(spawnedtile))
            spawned++;
            TileChoices.splice(choice, 1);
        }
    }
    tileDiscoveryCheck();
    displayGrid();
    return spawnedTiles;
}

function refillSpawnBox(entry) { // When a spawn box is empty, this function refills it.
    let j = 2;
    while (j < TileSpawns[entry].length) {
        if ((j < TileSpawns[entry].length - 1) && (typeof TileSpawns[entry][j + 1] == "number")) {
            for (let k = 0; k < TileSpawns[entry][j + 1]; k++) SpawnBoxes[entry].push(TileSpawns[entry][j]);
            j += 2;
        }
        else {
            SpawnBoxes[entry].push(TileSpawns[entry][j]);
            j += 1;
        }
    }
}

function forcedSpawnTiles(timing, vdir, hdir) {
    let addInfo = [1, Infinity, 0];
    if (arguments.length > 3) addInfo = arguments[3];
    let spawnedTiles = [];
    let tilesToSpawn = [];
    let gameOverPossible = [];
    for (let f = 0; f < forcedSpawns.length; f++) {
        if (CalcArray(forcedSpawns[f][0], 0, 0, vdir, hdir, addInfo) === true && forcedSpawns[f][1] == timing) {
            for (let t = 3; t < forcedSpawns[f].length; t++) {
                tilesToSpawn.push(forcedSpawns[f][t]);
                gameOverPossible.push(forcedSpawns[f][2]);
            }
        }
    }
    if (tilesToSpawn.length > 0) {
        let TileChoices = [];
        if (spawnLocation == "Edge" && (vdir != 0 || hdir != 0)) {
            let iterations = 0;
            let edgefound = false;
            Edge_Finder: {
                while (!edgefound) {
                    if (vdir < 0 && hdir == 0) {
                        for (let column = 0; column < width; column++) {
                            TileChoices.push([height - 1 - iterations, column]);
                        }
                    }
                    else if (vdir > 0 && hdir == 0) {
                        for (let column = 0; column < width; column++) {
                            TileChoices.push([iterations, column]);
                        }
                    }
                    else if (vdir == 0 && hdir < 0) {
                        for (let row = 0; row < height; row++) {
                            TileChoices.push([row, width - 1 - iterations]);
                        }
                    }
                    else if (vdir == 0 && hdir > 0) {
                        for (let row = 0; row < height; row++) {
                            TileChoices.push([row, iterations]);
                        }
                    }
                    else if (vdir < 0 && hdir < 0) {
                        let row = height - 1 - iterations;
                        let column = width - 1;
                        for (let i = 0; i <= iterations; i++) {
                            TileChoices.push([row, column]);
                            row++;
                            column--;
                        }
                    }
                    else if (vdir > 0 && hdir < 0) {
                        let row = 0;
                        let column = width - 1 - iterations;
                        for (let i = 0; i <= iterations; i++) {
                            TileChoices.push([row, column]);
                            row++;
                            column++;
                        }
                    }
                    else if (vdir < 0 && hdir > 0) {
                        let row = height - 1 - iterations;
                        let column = 0;
                        for (let i = 0; i <= iterations; i++) {
                            TileChoices.push([row, column]);
                            row++;
                            column++;
                        }
                    }
                    else if (vdir > 0 && hdir > 0) {
                        let row = 0;
                        let column = iterations;
                        for (let i = 0; i <= iterations; i++) {
                            TileChoices.push([row, column]);
                            row++;
                            column--;
                        }
                    }
                    for (let t = 0; t < TileChoices.length; t++) {
                        if (Grid[TileChoices[t][0]][TileChoices[t][1]] != "@Void") {edgefound = true; break Edge_Finder;}
                    }
                    iterations++;
                }
            }
        }
        else {
            for (let row = 0; row < height; row++) {
                for (let column = 0; column < width; column++) {
                    TileChoices.push([row, column]);
                }
            }
        }
        SpawningForcedTiles: {
            while (tilesToSpawn.length > 0 && TileChoices.length > 0) {
                //Which tile is being spawned in?
                let found = false;
                let choice = 0;
                let row = 0;
                let column = 0;
                while (!found) {
                    choice = getRndInteger(0, TileChoices.length - 1);
                    row = TileChoices[choice][0];
                    column = TileChoices[choice][1];
                    if (Grid[row][column] == "@Empty") found = true;
                    else {
                        TileChoices.splice(choice, 1);
                        if (TileChoices.length == 0) {
                            displayGrid();
                            break SpawningForcedTiles;
                        }
                    }
                }
                //Do the spawning
                Grid[row][column] = structuredClone(tilesToSpawn[0]);
                spawnedTiles.push(structuredClone(tilesToSpawn[0]))
                TileChoices.splice(choice, 1);
                tilesToSpawn.shift();
                gameOverPossible.shift();
            }
        }
        if (gameOverPossible.indexOf(true) > -1) won = -2; // You lose!
        tileDiscoveryCheck();
        displayGrid();
        return spawnedTiles;
    }
}

async function MoveHandler(direction_num) {
    /*
    This is probably the second most important function here (I'd say CalcArray is the most important), as this function is what performs moves,
    which are, y'know, how the game is played. MoveHandler is asynchronous so that the delay function can be used for tile animations, but since it sets
    inputAvailable to false for the duration of the move, you can't do other things during a move.
    */
    let manual = true;
    if (arguments.length > 1) manual = arguments[1];
    let direction = [];
    if (manual) direction = directions[direction_num][0];
    else direction = auto_directions[direction_num][0];
    let vdir = direction[0];
    let hdir = direction[1];
    let slideAmount = direction[2];
    let moveType = 0;
    if (direction.length > 3) moveType = direction[3];
    let manualStrength = [1, true, true, true];
    /* 
        This array of four entries distinguishes manual and automatic moves.
        If manualStrength[0] is 1, it's a manual move. Only these will trigger automatic moves from them, and only these increment manual_moves_so_far.
        If manualStrength[0] is 0, it's an automatic move.
        If manualStrength[0] is -1, it's an automatic move that counts as part of the manual move that triggered it, which means moves_so_far doesn't increment, tiles don't spawn, and so on.
        manualStrength[1] is whether merges can occur, manualStrength[2] is whether length-0 merges can occur, and manualStrength[3] is whether scripts that execute at the beginning or end of a move (BeginTurn, EndMovement, EndTurn, etc.) execute or not.
    */
    if (direction.length > 4) manualStrength = direction[4];
    if (manualStrength[3]) executeScripts("BeginTurn", 0, 0, vdir, hdir, [1, slideAmount, moveType]);
    if (manual) inputAvailable = false;
    displayButtons(false);
    let movementOccurred = false; // If this is still false by the end of the move, then a move hasn't actually occured, so mark the direction as not available and don't spawn more tiles.
    let mergeCount = 0; // How many merges have occurred this move?
    let TileOrder = []; // When moving upwards, tiles closest to the top move first, and similarly for the other directions. Vertical outweighs horizontal, though that choice is arbitrary
    let stillMoving = []; // Which tiles in TileOrder are still moving?
    let mergeable = []; // Which tiles in TileOrder haven't merged already?
    if (manualStrength[0] == 1) {
        for (let a = 0; a < auto_directions.length; a++) {
            if (auto_directions[a][1] == "Before" && (auto_directions[a].length < 3 || CalcArray(auto_directions[a][2], 0, 0, vdir, hdir, [1, slideAmount, moveType]) === true)) {
                let subMoved = await MoveHandler(a, false);
                if (subMoved) movementOccurred = true;
            }
        }
    }
    if ((vdir == 0 && hdir == 0) || slideAmount == 0) { // If both movement magnitudes are zero, this move is just staying still and letting new tiles spawn
        for (let row = 0; row < height; row++) {
            for (let column = 0; column < width; column++) {
                TileOrder.push([row, column]);
                stillMoving.push(true);
                mergeable.push(true);
            }
        }
        for (let row = 0; row < height; row++) {
            for (let column = 0; column < width; column++) {
                if (Grid[row][column] == "@Empty") {
                    movementOccurred = true;
                    executeScripts("StayStill", 0, 0, vdir, hdir, [1, slideAmount, moveType]);
                    break;
                }
            }
        }
    }
    else {
        if (vdir < 0) {
            for (let row = 0; row < height; row++) {
                for (let column = 0; column < width; column++) {
                    TileOrder.push([row, column]);
                    stillMoving.push(true);
                    mergeable.push(true);
                }
            }
        }
        else if (vdir > 0) {
            for (let row = height - 1; row >= 0; row--) {
                for (let column = 0; column < width; column++) {
                    TileOrder.push([row, column]);
                    stillMoving.push(true);
                    mergeable.push(true);
                }
            }
        }
        else if (hdir < 0) {
            for (let column = 0; column < width; column++) {
                for (let row = 0; row < height; row++) {
                    TileOrder.push([row, column]);
                    stillMoving.push(true);
                    mergeable.push(true);
                }
            }
        }
        else if (hdir > 0) {
            for (let column = width - 1; column >= 0; column--) {
                for (let row = 0; row < height; row++) {
                    TileOrder.push([row, column]);
                    stillMoving.push(true);
                    mergeable.push(true);
                }
            }
        }
        let slides = 0; // How many times have all the tiles gone through the movement process? If this value reaches SlideAmount, end the move early.
        let endScriptsChecked = false;
        while ((stillMoving.indexOf(true) > -1 || !endScriptsChecked) && slides < slideAmount) {
            let oldStillMoving = structuredClone(stillMoving); // oldStillMoving is used for animation purposes
            for (let position of TileOrder) {
                let index = indexOfPrimArray(position, TileOrder);
                if (!(stillMoving[index])) continue;
                let tile = Grid[position[0]][position[1]];
                let paramV = CalcArray(movementParameters[0], position[0], position[1], vdir, hdir, [1, slideAmount, moveType]);
                let paramH = CalcArray(movementParameters[1], position[0], position[1], vdir, hdir, [1, slideAmount, moveType]);
                let paramSlide = CalcArray(movementParameters[2], position[0], position[1], vdir, hdir, [1, slideAmount, moveType]);
                if ((paramV == 0 && paramH == 0) || slides >= paramSlide) { stillMoving[index] = false; oldStillMoving[index] = false; continue; }
                let nextpositions = [];
                let nextindices = [];
                let nexttiles = [];
                let finding_positions = true;
                while (finding_positions) {
                    if (nextpositions.length == 0) nextpositions.push(structuredClone(position));
                    else nextpositions.push(structuredClone(nextpositions[nextpositions.length - 1]));
                    nextpositions[nextpositions.length - 1][0] += paramV;
                    nextpositions[nextpositions.length - 1][1] += paramH;
                    if (indexOfPrimArray(nextpositions[nextpositions.length - 1], TileOrder) == -1) {
                        nextpositions.pop();
                        finding_positions = false;
                    }
                    else {
                        nextindices.push(indexOfPrimArray([nextpositions[nextpositions.length - 1][0], nextpositions[nextpositions.length - 1][1]], TileOrder));
                        nexttiles.push(Grid[nextpositions[nextpositions.length - 1][0]][nextpositions[nextpositions.length - 1][1]]);
                    }
                }
                if (tile == "@Empty" || tile == "@Void") {
                    stillMoving[index] = false; oldStillMoving[index] = false; continue;
                }
                else if (nexttiles[0] == "@Empty") { // If the tile ahead of the currently-examined tile is empty, the tile moves
                    Grid[nextpositions[0][0]][nextpositions[0][1]] = structuredClone(Grid[position[0]][position[1]]);
                    Grid[position[0]][position[1]] = "@Empty";
                    stillMoving[index] = false;
                    stillMoving[nextindices[0]] = true;
                    movementOccurred = true;
                    if (manualStrength[3]) executeScripts("TileMove", position[0], position[1], paramV, paramH, [1, paramSlide, moveType]);
                }
                else if ((mergeable[index] || multiMerge) && manualStrength[1]) { // Checking for an applicable merge rule, and applying it if one is found. Earlier entries in MergeRules take priority over later ones.
                    let rule = false;
                    let vars = [];
                    MergeCheck: {
                        for (let m = 0; m < MergeRules.length; m++) {
                            let checkedrule = structuredClone(MergeRules[m]);
                            vars = [];
                            let mlength = checkedrule[0];
                            if (checkedrule[0] === "@include_gvars") mlength = checkedrule[1];
                            if (checkedrule.indexOf("@end_vars") > -1) mlength = checkedrule[checkedrule.indexOf("@end_vars") + 1];
                            if (checkedrule[0] === "@include_gvars") {
                                let newvars = structuredClone(game_vars);
                                for (let v = 0; v < newvars.length; v++) {
                                    newvars[v] = CalcArrayConvert(newvars[v], "=", position[0], position[1], paramV, paramH, [mlength, paramSlide, moveType], Grid, [], vars);
                                    if (Array.isArray(newvars[v])) newvars[v].unshift("@Literal");
                                    vars.push(newvars[v]);
                                }
                                checkedrule.shift();
                            }
                            if (checkedrule.indexOf("@end_vars") > -1) {
                                let newvars = checkedrule.slice(0, checkedrule.indexOf("@end_vars"));
                                for (let v = 0; v < newvars.length; v++) {
                                    newvars[v] = CalcArrayConvert(newvars[v], "=", position[0], position[1], paramV, paramH, [mlength, paramSlide, moveType], Grid, [], vars);
                                    if (Array.isArray(newvars[v])) newvars[v].unshift("@Literal");
                                    vars.push(newvars[v]);
                                }
                                checkedrule.splice(0, checkedrule.indexOf("@end_vars") + 1);
                            }
                            if (checkedrule[0] == 0) continue; // Merge rules of length 0 are a special case that's saved for the end of the move
                            checkedrule = evaluateMergeRule(checkedrule, position[0], position[1], paramV, paramH, [mlength, paramSlide, moveType], Grid, vars);
                            if (checkedrule[2]) {
                                if (nextpositions.length >= checkedrule[0] - 1 && CalcArray(checkedrule[1], position[0], position[1], paramV, paramH, [checkedrule[0], paramSlide, moveType], Grid, [], vars) === true) {
                                    rule = checkedrule;
                                    break MergeCheck;
                                }
                            }
                            else if (nextpositions.length >= checkedrule[0] - 1) { // If the 2nd entry is false, we need to look at every permutation of the merge rule, which grows factorially with the length of the rule, to see if any permutation evaluates to true
                                let arrangements = orders(checkedrule[0]);
                                for (let permu = 0; permu < arrangements.length; permu++) {
                                    let testing = calcArrayReorder(checkedrule, arrangements[permu], paramV, paramH);
                                    if (CalcArray(testing[1], position[0], position[1], paramV, paramH, [checkedrule[0], paramSlide, moveType], Grid, [], vars) === true) {
                                        rule = testing;
                                        break MergeCheck;
                                    }
                                }
                            }
                        }
                    }
                    if (rule !== false) { // If we found a rule, it's time to do the merge
                        Merge: {
                            for (let p = rule[0] - 1; p >= 0; p--) { //...but only if all the tiles in the merge are still capable of merging
                                if ((mergeable[nextindices[p - 1]] === false || mergeable[index] === false) && !multiMerge) {
                                    stillMoving[index] = false;
                                    oldStillMoving[index] = false;
                                    break Merge;
                                }
                            }
                            let entry = -1;
                            let preMergeGrid = structuredClone(Grid);
                            let mergeResults = ["@Literal"];
                            for (let p = rule[0] - 1; p >= 0; p--) {
                                entry++;
                                let examinedposition, examinedindex, examinedtile;
                                if (p == 0) {
                                    examinedposition = position;
                                    examinedindex = index;
                                    examinedtile = tile;
                                }
                                else {
                                    examinedposition = nextpositions[p - 1];
                                    examinedindex = nextindices[p - 1];
                                    examinedtile = nexttiles[p - 1];
                                }
                                if (entry < rule[3].length) {
                                    let newarray = [];
                                    for (let tentry of rule[3][entry]) {newarray.push(CalcArray(tentry, position[0], position[1], paramV, paramH, [rule[0], paramSlide, moveType], preMergeGrid, [], vars));}
                                    if (typeof newarray == "boolean") newarray = "@Empty";
                                    Grid[examinedposition[0]][examinedposition[1]] = newarray;
                                    mergeResults.push(newarray);
                                    mergeable[examinedindex] = rule[5][entry];
                                    oldStillMoving[examinedindex] = !(rule[5][entry]);
                                }
                                else {
                                    Grid[examinedposition[0]][examinedposition[1]] = "@Empty";
                                    mergeable[examinedindex] = rule[5][entry];
                                    oldStillMoving[examinedindex] = true;
                                }
                            }
                            merges_so_far++;
                            oldStillMoving[nextindices[rule[0] - 2]] = false;
                            score += CalcArrayConvert(CalcArray(rule[4], position[0], position[1], paramV, paramH, [rule[0], paramSlide, moveType], preMergeGrid, [], vars), "+", position[0], position[1], paramV, paramH, [rule[0], paramSlide, moveType], preMergeGrid, [], vars);
                            executeScripts("Merge", position[0], position[1], paramV, paramH, [rule[0], paramSlide], Grid, [], vars.concat(mergeResults));
                            tileDiscoveryCheck();
                            movementOccurred = true;
                            mergeCount++;
                            for (let t = 0; t < stillMoving.length; t++) stillMoving[t] = true;
                        }
                    }
                    else {
                        stillMoving[index] = false; oldStillMoving[index] = false;
                    }
                }
                else {
                    stillMoving[index] = false; oldStillMoving[index] = false;
                }
            }
            if (modifiers[16] > 0) { // Movement animation
                let frames = 10 / modifiers[16];
                frames = Math.ceil(40 / modifiers[16] / Math.max(width, height) * Math.max(Math.abs(vdir), Math.abs(hdir)));
                for (let f = 1; f <= frames; f++) {
                    for (let i = 0; i < TileOrder.length; i++) {
                        if (oldStillMoving[i]) {
                            let paramV = CalcArray(movementParameters[0], TileOrder[i][0], TileOrder[i][1], vdir, hdir, [1, slideAmount, moveType]);
                            let paramH = CalcArray(movementParameters[1], TileOrder[i][0], TileOrder[i][1], vdir, hdir, [1, slideAmount, moveType]);
                            let tID = "Tile_" + TileOrder[i][0] + "_" + TileOrder[i][1];
                            document.getElementById(tID).style.setProperty("left", (100 / frames * f * paramH) + "%");
                            document.getElementById(tID).style.setProperty("top", (100 / frames * f * paramV) + "%");
                        }
                    }
                    await delay(0);
                }
            }
            slides++;
            executeScripts("MoveIteration", 0, 0, vdir, hdir, [1, slideAmount, moveType]);
            displayGrid();
            if (stillMoving.indexOf(true) == -1) {
                if (!endScriptsChecked) {
                    if (executeScripts("PossibleEnd", 0, 0, vdir, hdir, [1, slideAmount, moveType]) > 0) { for (let t = 0; t < stillMoving.length; t++) stillMoving[t] = true; }
                    endScriptsChecked = true;
                }
            }
            else endScriptsChecked = false;
        }
    }
    if (manualStrength[0] == 1) {
        for (let a = 0; a < auto_directions.length; a++) {
            if (auto_directions[a][1] == "Between" && (auto_directions[a].length < 3 || CalcArray(auto_directions[a][2], 0, 0, vdir, hdir, [1, slideAmount, moveType]) === true)) {
                let subMoved = await MoveHandler(a, false);
                if (subMoved) movementOccurred = true;
            }
        }
    }
    if (movementOccurred) {
        executeScripts("EndMovementDirection", 0, 0, vdir, hdir, [1, slideAmount, moveType]);
        if (manualStrength[3]) executeScripts("EndMovement", 0, 0, vdir, hdir, [1, slideAmount, moveType]);
        if (manual) {
            for (let d = 0; d < directionsAvailable.length; d++) {directionsAvailable[d] = true;} //For unknown reasons, a for-of loop refuses to work here
        }
        if (manualStrength[2]) {
            for (let position of TileOrder) {
                if (Grid[position[0]][position[1]] == "@Empty" || Grid[position[0]][position[1]] == "@Void") continue;
                for (let m = 0; m < MergeRules.length; m++) {
                    /*
                    This checks for merge rules of length 0, which are a special case: merge rules of length 0 are effects that are applied to a single tile
                    at the end of the move. Each length 0 merge rule is only checked once per tile per move. For example, Isotopic 256 uses length-0 merge rules
                    to decrease the radioactivity counters of radioactive tiles.
                    */
                    let rule = false;
                    let checkedrule = structuredClone(MergeRules[m]);
                    let vars = [];
                    let mlength = checkedrule[0];
                    if (checkedrule[0] === "@include_gvars") mlength = checkedrule[1];
                    if (checkedrule.indexOf("@end_vars") > -1) mlength = checkedrule[checkedrule.indexOf("@end_vars") + 1];
                    if (mlength != 0) continue;
                    if (checkedrule[0] === "@include_gvars") {
                        let newvars = structuredClone(game_vars);
                        for (let v = 0; v < newvars.length; v++) {
                            newvars[v] = CalcArrayConvert(newvars[v], "=", position[0], position[1], vdir, hdir, [mlength, slideAmount, moveType], Grid, [], vars);
                            if (Array.isArray(newvars[v])) newvars[v].unshift("@Literal");
                            vars.push(newvars[v]);
                        }
                        checkedrule.shift();
                    }
                    if (checkedrule.indexOf("@end_vars") > -1) {
                        let newvars = checkedrule.slice(0, checkedrule.indexOf("@end_vars"));
                        for (let v = 0; v < newvars.length; v++) {
                            newvars[v] = CalcArrayConvert(newvars[v], "=", position[0], position[1], vdir, hdir, [mlength, slideAmount, moveType], Grid, [], vars);
                            if (Array.isArray(newvars[v])) newvars[v].unshift("@Literal");
                            vars.push(newvars[v]);
                        }
                        checkedrule.splice(0, checkedrule.indexOf("@end_vars") + 1);
                    }
                    checkedrule = evaluateMergeRule(checkedrule, position[0], position[1], vdir, hdir, [mlength, slideAmount, moveType], Grid, vars);
                    if (checkedrule[2]) {
                        if (CalcArray(checkedrule[1], position[0], position[1], vdir, hdir, [checkedrule[0], slideAmount, moveType], Grid, [], vars) === true) {
                            rule = checkedrule;
                        }
                    }
                    checkedrule = evaluateMergeRule(checkedrule, position[0], position[1], vdir, hdir, Grid, [], vars);
                    if (CalcArray(checkedrule[1], position[0], position[1], vdir, hdir, [0, slideAmount, moveType]) === true) {
                        rule = checkedrule;
                    }
                    if (rule !== false) {
                        let entry = 0;
                        let preMergeGrid = structuredClone(Grid);
                        if (entry < rule[3].length) {
                            let newarray = [];
                            for (let tentry of rule[3][entry]) {newarray.push(CalcArray(tentry, position[0], position[1], vdir, hdir, [rule[0], slideAmount, moveType], preMergeGrid, [], vars));}
                            if (typeof newarray == "boolean") newarray = "@Empty";
                            Grid[position[0]][position[1]] = newarray;
                        }
                        else {
                            Grid[position[0]][position[1]] = "@Empty";
                        }
                        score += CalcArrayConvert(CalcArray(rule[4], position[0], position[1], vdir, hdir, [rule[0], slideAmount, moveType], preMergeGrid, [], vars), "+", position[0], position[1], vdir, hdir, [rule[0], slideAmount, moveType], preMergeGrid, [], vars);
                        executeScripts("ZeroMerge", position[0], position[1], vdir, hdir, [rule[0], slideAmount], preMergeGrid, [], vars);
                        tileDiscoveryCheck();
                    }
                }
            }
        }
        if (manualStrength[0] > -1) moves_so_far++;
        if (manualStrength[0] == 1) manual_moves_so_far++;
        if (mergeCount > 0) { // Transferring the merges done this move into Merges Before This Move
            if (manualStrength[0] > -1) moves_where_merged++;
            merges_before_now += mergeCount;
        }
        if (CalcArray(spawnConditions) === true && manualStrength[0] > -1) {
            if (manualStrength[3]) executeScripts("PreSpawn", 0, 0, vdir, hdir, [1, slideAmount, moveType]);
            let spawnedTiles = ["@Literal"];
            spawnedTiles.concat(
                forcedSpawnTiles("BeforeSpawns", vdir, hdir, [1, slideAmount, moveType]),
                RandomTiles(randomTileAmount, vdir, hdir, [1, slideAmount, moveType]),
                forcedSpawnTiles("AfterSpawns", vdir, hdir, [1, slideAmount, moveType]),
            );
            if (manualStrength[3]) executeScripts("PostSpawn", 0, 0, vdir, hdir, [1, slideAmount, moveType], Grid, [], [spawnedTiles]);
        }
        if (manualStrength[3]) executeScripts("EndTurn", 0, 0, vdir, hdir, [1, slideAmount, moveType]);
    }
    else {
        if (manual) directionsAvailable[direction_num] = false; // Marks the direction as not available if the move failed
    }
    if (manualStrength[0] == 1) {
        for (let a = 0; a < auto_directions.length; a++) {
            if (auto_directions[a][1] == "After" && (auto_directions[a].length < 3 || CalcArray(auto_directions[a][2], 0, 0, vdir, hdir, [1, slideAmount, moveType]) === true)) {
                let subMoved = await MoveHandler(a, false);
                if (subMoved) movementOccurred = true;
            }
        }
    }
    tileDiscoveryCheck();
    let victory = winCheck();
    displayGrid();
    if (directionsAvailable.indexOf(true) == -1 && manualStrength[0] > -1) {
        if (!possibleOverChecked && executeScripts("PossibleOver", 0, 0, vdir, hdir, [1, slideAmount, moveType]) > 0) {
            for (let d = 0; d < directionsAvailable.length; d++) {directionsAvailable[d] = true;}
            possibleOverChecked = true;
            displayButtons(true);
            inputAvailable = true;
        }
        else {
            executeScripts("GameOver", 0, 0, vdir, hdir, [1, slideAmount, moveType]);
            GameOver();
        }
    }
    else {
        if ((victory == 1 || (victory == 2 && winPriority)) && manualStrength[0] > -1) {
            executeScripts("Victory", 0, 0, vdir, hdir, [1, slideAmount, moveType]);
            winScreen();
        }
        else if ((victory == -1 || (victory == 2 && !winPriority)) && manualStrength[0] > -1) {
            executeScripts("GameOver", 0, 0, vdir, hdir, [1, slideAmount, moveType]);
            GameOver();
        }
        else if (manual) {
            displayButtons(true);
            inputAvailable = true;
        }
    }
    return movementOccurred;
}

function tileDiscoveryCheck() { // Adds newly-discovered tiles into discoveredTiles if there are any
    for (let row = 0; row < height; row++) {
        for (let column = 0; column < width; column++) {
            if (indexOfPrimArray(Grid[row][column], discoveredTiles) == -1 && !(Grid[row][column] == "@Empty" || Grid[row][column] == "@Void"))
                discoveredTiles.push(Grid[row][column]);
        }
    }
}

function winCheck() { // Adds newly-discovered winning tiles into discoveredWinning if there are any, and checks to see if the game has been won; likewise for discoveredLosing. Returns 0 if neither, returns 1 if won, returns -1 if lost, and returns 2 if both
    let checkWin = false;
    let checkLose = false;
    for (let row = 0; row < height; row++) {
        for (let column = 0; column < width; column++) {
            if (indexOfPrimArray(Grid[row][column], discoveredWinning) == -1) {
                let winnum = 0;
                let winfound = false;
                while ((!winfound) && winnum < winConditions.length) {
                    if (eqPrimArrays(winConditions[winnum], Grid[row][column]) || (CalcArray(winConditions[winnum], row, column) === true)) winfound = true;
                    else winnum++;
                }
                if (winfound) {
                    discoveredWinning.push(Grid[row][column]);
                }
            }
        }
    }
    for (let row = 0; row < height; row++) {
        for (let column = 0; column < width; column++) {
            if (indexOfPrimArray(Grid[row][column], discoveredLosing) == -1) {
                let losenum = 0;
                let losefound = false;
                while ((!losefound) && losenum < loseConditions.length) {
                    if (eqPrimArrays(loseConditions[losenum], Grid[row][column]) || (CalcArray(loseConditions[losenum], row, column) === true)) losefound = true;
                    else losenum++;
                }
                if (losefound) {
                    discoveredLosing.push(Grid[row][column]);
                }
            }
        }
    }
    if (won != -1 && won != -3) {
        if (won >= 0) won = discoveredWinning.length;
        if (typeof winRequirement == "number" && discoveredWinning.length >= winRequirement) checkWin = true;
        if (typeof winRequirement != "number" && CalcArray(winRequirement) === true) checkWin = true;
    }
    if (won == -2 || won == -3) checkLose = true;
    if (typeof loseRequirement == "number" && discoveredLosing.length >= loseRequirement) checkLose = true;
    if (typeof loseRequirement != "number" && CalcArray(loseRequirement) === true) checkLose = true;
    if (checkWin && checkLose) return 2;
    else if (checkWin && !checkLose) return 1;
    else if (!checkWin && checkLose) return -1;
    else return 0;
}

function executeScripts(type) { //Runs the scripts of that type, and returns the amount of scripts that were run
    let vcoord = 0; let hcoord = 0; let vdir = 0; let hdir = 0; let addInfo = [1, Infinity, 0]; let gri = Grid; let parents = []; let vars = [];
    if (arguments.length > 1) vcoord = arguments[1];
    if (arguments.length > 2) hcoord = arguments[2];
    if (arguments.length > 3) vdir = arguments[3];
    if (arguments.length > 4) hdir = arguments[4];
    if (arguments.length > 5) addInfo = arguments[5];
    if (arguments.length > 6) gri = arguments[6];
    if (arguments.length > 7) parents = arguments[7];
    if (arguments.length > 8) vars = arguments[8];
    let srun = 0; // How many scripts have been run this call
    for (let i = 0; i < scripts.length; i++) {
        if (scripts[i][1] == type) {
            CalcArray(scripts[i][0], vcoord, hcoord, vdir, hdir, addInfo, gri, parents, vars);
            srun++;
        }
    }
    return srun;
    /*
    List of script types:
        BeginTurn: Executes at the beginning of each turn
        EndTurn: Executes at the end of each turn
        StayStill: Executes before EndMovement scripts on a staying still movement (vdir and hdir are both 0 and/or slideAmount is 0)
        MoveIteration: Executes after each "slide", i.e. after every tile that's going to move moves one move in the direction of movement
        TileMove: Executes whenever a tile moves
        Merge: Executes whenever a merge occurs (not including length-0 merges). If @var-retain or @var-copy is included, then the variables of the merge rule are included, and one more variable comes after them, that being an array of the tiles resulting from the merge.
        EndMovement: Executes when the movement of that turn finishes, but before length-0 merges
        EndMovementDirection: Executes right before the EndMovement scripts; unlike the EndMovement scripts, these can trigger even on automatic moves that don't trigger beginning/end scripts
        PossibleEnd: Executes when the movement of that turn is about to finish; if there are any of these scripts, the end of the turn is postponed in case tiles can still move after the script (the turn then ends if no tiles move right afterwards)
        PreSpawn: Executes right before the new random tiles spawn; will not execute if spawnConditions evaluates to false this turn
        PostSpawn: Executes right before the new random tiles spawn; will not execute if spawnConditions evaluates to false this turn. For these scripts, if @var_retain or @var_copy is included, "@Var 0" is an array of the tiles that were just spawned.
        ZeroMerge: Executes whenever a length-0 merge occurs
        PossibleOver: Executes when it's about to be Game Over: if there are any of these scripts, the Game Over is postponed in case it's not quite game over yet (but if there are still no moves left, then it's game over for real)
        Victory: Executes upon winning (right before the win screen pops up)
        GameOver: Executes upon Game Over (right before the Game Over screen pops up)
        None: Is not triggered automatically, but can still be called directly in CalcArray expressions (this is true of any type that aren't the ones listed above, but "None" is the recommended way to denote this)
    */
}


//Endgame
async function GameOver() {
    currentScreen = "Game Over";
    document.getElementById("game_over_screen").style.setProperty("opacity", 0);
    document.getElementById("game_over_screen").style.setProperty("display", "flex");
    let frames = 100;
    if (modifiers[16] > 0) {
        frames = 100/modifiers[16];
        for (let f = 0; f < frames; f++) {
            document.getElementById("game_over_screen").style.setProperty("opacity", f / frames);
            await delay(2);
        }
    }
    document.getElementById("game_over_screen").style.setProperty("opacity", 1);
    displayButtons(false);
    inputAvailable = true;
}

async function winScreen() {
    currentScreen = "Win";
    document.getElementById("win_screen").style.setProperty("opacity", 0);
    document.getElementById("win_screen").style.setProperty("display", "flex");
    if (postgameAllowed) {
        document.getElementById("win_again").style.setProperty("display", "flex");
        document.getElementById("win_continue").style.setProperty("display", "flex");
        document.getElementById("lone_win_again").style.setProperty("display", "none");
    }
    else {
        document.getElementById("win_again").style.setProperty("display", "none");
        document.getElementById("win_continue").style.setProperty("display", "none");
        document.getElementById("lone_win_again").style.setProperty("display", "flex");
    }
    let frames = 100;
    if (modifiers[16] > 0) {
        frames = 100/modifiers[16];
        for (let f = 0; f < frames; f++) {
            document.getElementById("win_screen").style.setProperty("opacity", f / frames);
            await delay(2);
        }
    }
    document.getElementById("win_screen").style.setProperty("opacity", 1);
    inputAvailable = true;
}

async function PlayAgain() {
    inputAvailable = false;
    document.getElementById("game_over_screen").style.setProperty("opacity", 0);
    document.getElementById("game_over_screen").style.setProperty("display", "none");
    document.getElementById("win_screen").style.setProperty("opacity", 0);
    document.getElementById("win_screen").style.setProperty("display", "none");
    for (let d = 0; d < directionsAvailable.length; d++) directionsAvailable[d] = true;
    possibleOverChecked = false;
    score = 0;
    won = 0;
    moves_so_far = 0;
    merges_so_far = 0;
    moves_where_merged = 0;
    merges_before_now = 0;
    discoveredTiles = [];
    discoveredWinning = [];
    discoveredLosing = [];
    Grid = structuredClone(startingGrid);
    loadResettingModifiers();
    currentScreen = "Gameplay";
    TileSpawns = structuredClone(startTileSpawns);
    game_vars = structuredClone(start_game_vars);
    modifier_vars = structuredClone(start_modifier_vars);
    forcedSpawnTiles("BeforeSpawns", 0, 0);
    RandomTiles(startTileAmount, 0, 0);
    forcedSpawnTiles("AfterSpawns", 0, 0);
    displayButtons(true);
    inputAvailable = true;
}

//Save codes

function SCstringify(input) { // My version of BigInts-compatible JSON.stringify, converting 100n into "@BigInt 100", which fits for this project because @ is the "this string is special" character for CalcArrays. Also allows infinities.
    return JSON.stringify(input, function(key, value) {
        if (typeof value == "bigint") return "@BigInt " + String(value);
        else if (value == Infinity) return "@Infinity";
        else if (value == -Infinity) return "@-Infinity";
        else return value;
    })
}

function SCparse(input) { // Undoes SCstringify
    return JSON.parse(input, function(key, value) {
        if (typeof value == "string" && value.substring(0, 8) == "@BigInt ") return BigInt(value.substring(8));
        else if (value == "@Infinity") return Infinity;
        else if (value == "@-Infinity") return -Infinity;
        else return value;
    })
}

function updateAtSign(array, version) { // Version 1.1 added @ to the front of Empty, Void, and color evaluation starts like HSLA and linear-gradient; this function updates the array it's given accordingly.
    deepArrayReplace("Empty", "@Empty", array);
    deepArrayReplace("Void", "@Void", array);
    deepArrayReplace("HSLA", "@HSLA", array);
    deepArrayReplace("RGBA", "@RGBA", array);
    deepArrayReplace("HSVA", "@HSVA", array);
    deepArrayReplace("linear-gradient", "@linear-gradient", array);
    deepArrayReplace("repeating-linear-gradient", "@repeating-linear-gradient", array);
    deepArrayReplace("radial-gradient", "@radial-gradient", array);
    deepArrayReplace("repeating-radial-gradient", "@repeating-radial-gradient", array);
    deepArrayReplace("conic-gradient", "@conic-gradient", array);
    deepArrayReplace("repeating-conic-gradient", "@repeating-conic-gradient", array);
    deepArrayReplace("multi-gradient", "@multi-gradient", array);
}

function exportSave(midgame) { // A save code where midgame = true saves a game in progress, a save code where midgame = false saves a gamemode. Mode save codes are currently unused in the project itself, but if you code your own 2048 mode using the 2048 Power Compendium's code, you can save it as a code and play it in the game
    try {
        let SaveCode = "";
        if (midgame) SaveCode = "@2048PowCompGame|";
        else SaveCode = "@2048PowCompMode|";
        SaveCode += "1.1|"
        SaveCode += window.btoa(String(width));
        SaveCode += "|";
        SaveCode += window.btoa(String(height));
        SaveCode += "|";
        SaveCode += window.btoa(SCstringify(startingGrid));
        SaveCode += "|";
        SaveCode += window.btoa(SCstringify(directions));
        SaveCode += "|";
        SaveCode += window.btoa(SCstringify(auto_directions));
        SaveCode += "|";
        SaveCode += window.btoa(SCstringify(movementParameters));
        SaveCode += "|";
        SaveCode += window.btoa(String(TileNumAmount));
        SaveCode += "|";
        SaveCode += window.btoa(SCstringify(TileTypes));
        SaveCode += "|";
        SaveCode += window.btoa(SCstringify(MergeRules));
        SaveCode += "|";
        SaveCode += window.btoa(SCstringify(startTileSpawns));
        SaveCode += "|";
        SaveCode += window.btoa(SCstringify(forcedSpawns));
        SaveCode += "|";
        SaveCode += window.btoa(SCstringify(winConditions));
        SaveCode += "|";
        SaveCode += window.btoa(SCstringify(winRequirement));
        SaveCode += "|";
        SaveCode += window.btoa(SCstringify(loseConditions));
        SaveCode += "|";
        SaveCode += window.btoa(SCstringify(loseRequirement));
        SaveCode += "|";
        SaveCode += window.btoa(SCstringify(winPriority));
        SaveCode += "|";
        SaveCode += window.btoa(SCstringify(postgameAllowed));
        SaveCode += "|";
        SaveCode += window.btoa(SCstringify(statBoxes));
        SaveCode += "|";
        SaveCode += window.btoa(getComputedStyle(document.documentElement).getPropertyValue("--background-color"));
        SaveCode += "|";
        SaveCode += window.btoa(getComputedStyle(document.documentElement).getPropertyValue("--grid-color"));
        SaveCode += "|";
        SaveCode += window.btoa(getComputedStyle(document.documentElement).getPropertyValue("--tile-color"));
        SaveCode += "|";
        SaveCode += window.btoa(getComputedStyle(document.documentElement).getPropertyValue("--text-color"));
        SaveCode += "|";
        SaveCode += window.btoa(document.getElementById("rules_text").innerHTML);
        SaveCode += "|";
        SaveCode += window.btoa(SCstringify(multiMerge));
        SaveCode += "|";
        SaveCode += window.btoa(String(spawnLocation));
        SaveCode += "|";
        SaveCode += window.btoa(String(startTileAmount));
        SaveCode += "|";
        SaveCode += window.btoa(String(randomTileAmount));
        SaveCode += "|";
        SaveCode += window.btoa(SCstringify(spawnConditions));
        SaveCode += "|";
        SaveCode += window.btoa(String(nextTiles));
        SaveCode += "|";
        SaveCode += window.btoa(SCstringify(start_game_vars));
        SaveCode += "|";
        SaveCode += window.btoa(SCstringify(start_modifier_vars));
        SaveCode += "|";
        SaveCode += window.btoa(SCstringify(scripts));
        SaveCode += "|";
        if (midgame) {
            SaveCode += window.btoa(SCstringify(Grid));
            SaveCode += "|";
            SaveCode += window.btoa(String(score));
            SaveCode += "|";
            SaveCode += window.btoa(String(won));
            SaveCode += "|";
            SaveCode += window.btoa(SCstringify(directionsAvailable));
            SaveCode += "|";
            SaveCode += window.btoa(SCstringify(TileSpawns));
            SaveCode += "|";
            SaveCode += window.btoa(SCstringify(SpawnBoxes));
            SaveCode += "|";
            SaveCode += window.btoa(SCstringify(spawnConveyor));
            SaveCode += "|";
            SaveCode += window.btoa(SCstringify(discoveredTiles));
            SaveCode += "|";
            SaveCode += window.btoa(SCstringify(discoveredWinning));
            SaveCode += "|";
            SaveCode += window.btoa(SCstringify(discoveredLosing));
            SaveCode += "|";
            SaveCode += window.btoa(String(moves_so_far));
            SaveCode += "|";
            SaveCode += window.btoa(String(manual_moves_so_far));
            SaveCode += "|";
            SaveCode += window.btoa(String(merges_so_far));
            SaveCode += "|";
            SaveCode += window.btoa(String(moves_where_merged));
            SaveCode += "|";
            SaveCode += window.btoa(String(merges_before_now));
            SaveCode += "|";
            SaveCode += window.btoa(SCstringify(game_vars));
            SaveCode += "|";
            SaveCode += window.btoa(SCstringify(modifier_vars));
            SaveCode += "|";
            SaveCode += window.btoa(SCstringify(possibleOverChecked));
            SaveCode += "|";
        }
        document.getElementById("save_code_box").value = SaveCode;
    }
    catch {
        document.getElementById("save_code_box").value = "There was an error with exporting your save code.";
    }
}

function importSave(code) {
    try {
        let coderesults = [];
        let codebits = code.split("|");
        if (!(codebits[0] == "@2048PowCompGame" || codebits[0] == "@2048PowCompMode")) throw "Wrong code type";
        if (codebits[1] == "1.1") {
            coderesults.push(Number(window.atob(codebits[2]))); //coderesults[0] is width
            if (isNaN(coderesults[0]) || coderesults[0] < 1 || (coderesults[0] % 1) != 0) throw "Invalid width";
            coderesults.push(Number(window.atob(codebits[3]))); //coderesults[1] is height
            if (isNaN(coderesults[1]) || coderesults[1] < 1 || (coderesults[1] % 1) != 0) throw "Invalid height";
            coderesults.push(SCparse(window.atob(codebits[4]))); //coderesults[2] is startingGrid
            coderesults.push(SCparse(window.atob(codebits[5]))); //coderesults[3] is directions
            coderesults.push(SCparse(window.atob(codebits[6]))); //coderesults[4] is auto_directions
            coderesults.push(SCparse(window.atob(codebits[7]))); //coderesults[5] is movementParameters
            coderesults.push(Number(window.atob(codebits[8]))); //coderesults[6] is TileNumAmount
            if (isNaN(coderesults[6]) || coderesults[6] < 1 || (coderesults[6] % 1) != 0) throw "Invalid amount of tile tier numbers";
            coderesults.push(SCparse(window.atob(codebits[9]))); //coderesults[7] is TileTypes
            coderesults.push(SCparse(window.atob(codebits[10]))); //coderesults[8] is MergeRules
            coderesults.push(SCparse(window.atob(codebits[11]))); //coderesults[9] is startTileSpawns
            coderesults.push(SCparse(window.atob(codebits[12]))); //coderesults[10] is forcedSpawns
            coderesults.push(SCparse(window.atob(codebits[13]))); //coderesults[11] is winConditions
            coderesults.push(SCparse(window.atob(codebits[14]))); //coderesults[12] is winRequirement
            coderesults.push(SCparse(window.atob(codebits[15]))); //coderesults[13] is loseConditions
            coderesults.push(SCparse(window.atob(codebits[16]))); //coderesults[14] is loseRequirement
            coderesults.push(SCparse(window.atob(codebits[17]))); //coderesults[15] is winPriority
            coderesults.push(SCparse(window.atob(codebits[18]))); //coderesults[16] is postgameAllowed
            coderesults.push(SCparse(window.atob(codebits[19]))); //coderesults[17] is statBoxes
            coderesults.push(window.atob(codebits[20])); //coderesults[18] is --background-color
            coderesults.push(window.atob(codebits[21])); //coderesults[19] is --grid-color
            coderesults.push(window.atob(codebits[22])); //coderesults[20] is --tile-color
            coderesults.push(window.atob(codebits[23])); //coderesults[21] is --text-color
            coderesults.push(window.atob(codebits[24])); //coderesults[22] is the rules text
            coderesults.push(SCparse(window.atob(codebits[25]))); //coderesults[23] is multiMerge
            coderesults.push(window.atob(codebits[26])); //coderesults[24] is spawnLocation
            coderesults.push(Number(window.atob(codebits[27]))); //coderesults[25] is startTileAmount
            coderesults.push(Number(window.atob(codebits[28]))); //coderesults[26] is randomTileAmount
            coderesults.push(SCparse(window.atob(codebits[29]))); //coderesults[27] is spawnConditions
            coderesults.push(Number(window.atob(codebits[30]))); //coderesults[28] is nextTiles
            coderesults.push(SCparse(window.atob(codebits[31]))); //coderesults[29] is start_game_vars
            coderesults.push(SCparse(window.atob(codebits[32]))); //coderesults[30] is start_modifier_vars
            coderesults.push(SCparse(window.atob(codebits[33]))); //coderesults[31] is scripts
            if (codebits[0] == "@2048PowCompGame") {
                coderesults.push(SCparse(window.atob(codebits[34]))); //coderesults[32] is Grid
                coderesults.push(Number(window.atob(codebits[35]))); //coderesults[33] is score
                coderesults.push(Number(window.atob(codebits[36]))); //coderesults[34] is won
                coderesults.push(SCparse(window.atob(codebits[37]))); //coderesults[35] is directionsAvailable
                coderesults.push(SCparse(window.atob(codebits[38]))); //coderesults[36] is TileSpawns
                coderesults.push(SCparse(window.atob(codebits[39]))); //coderesults[37] is SpawnBoxes
                coderesults.push(SCparse(window.atob(codebits[40]))); //coderesults[38] is spawnConveyor
                coderesults.push(SCparse(window.atob(codebits[41]))); //coderesults[39] is discoveredTiles
                coderesults.push(SCparse(window.atob(codebits[42]))); //coderesults[40] is discoveredWinning
                coderesults.push(SCparse(window.atob(codebits[43]))); //coderesults[41] is discoveredLosing
                coderesults.push(Number(window.atob(codebits[44]))); //coderesults[42] is moves_so_far
                coderesults.push(Number(window.atob(codebits[45]))); //coderesults[43] is manual_moves_so_far
                coderesults.push(Number(window.atob(codebits[46]))); //coderesults[44] is merges_so_far
                coderesults.push(Number(window.atob(codebits[47]))); //coderesults[45] is moves_where_merged
                coderesults.push(Number(window.atob(codebits[48]))); //coderesults[46] is merges_before_now
                coderesults.push(SCparse(window.atob(codebits[49]))); //coderesults[47] is game_vars
                coderesults.push(SCparse(window.atob(codebits[50]))); //coderesults[48] is modifier_vars
                coderesults.push(SCparse(window.atob(codebits[51]))); //coderesults[49] is possibleOverChecked
            }
            //If we've gotten this far, the import is a success, so it's time to do the actual importing
            width = coderesults[0];
            height = coderesults[1];
            startingGrid = coderesults[2];
            directions = coderesults[3];
            auto_directions = coderesults[4];
            movementParameters = coderesults[5];
            TileNumAmount = coderesults[6];
            TileTypes = coderesults[7];
            MergeRules = coderesults[8];
            startTileSpawns = coderesults[9];
            forcedSpawns = coderesults[10];
            winConditions = coderesults[11];
            winRequirement = coderesults[12];
            loseConditions = coderesults[13];
            loseRequirement = coderesults[14];
            winPriority = coderesults[15];
            postgameAllowed = coderesults[16];
            statBoxes = coderesults[17];
            document.documentElement.style.setProperty("--background-color", coderesults[18]);
            document.documentElement.style.setProperty("--grid-color", coderesults[19]);
            document.documentElement.style.setProperty("--tile-color", coderesults[20]);
            document.documentElement.style.setProperty("--text-color", coderesults[21]);
            document.getElementById("rules_text").innerHTML = coderesults[22];
            multiMerge = coderesults[23];
            spawnLocation = coderesults[24];
            startTileAmount = coderesults[25];
            randomTileAmount = coderesults[26];
            spawnConditions = coderesults[27];
            nextTiles = coderesults[28];
            start_game_vars = coderesults[29];
            start_modifier_vars = coderesults[30];
            scripts = coderesults[31];
            gamemode = 0;
            startGame();
            if (codebits[0] == "@2048PowCompGame") {
                Grid = coderesults[32];
                score = coderesults[33];
                won = coderesults[34];
                directionsAvailable = coderesults[35];
                TileSpawns = coderesults[36];
                SpawnBoxes = coderesults[37];
                spawnConveyor = coderesults[38];
                discoveredTiles = coderesults[39];
                discoveredWinning = coderesults[40];
                discoveredLosing = coderesults[41];
                moves_so_far = coderesults[42];
                manual_moves_so_far = coderesults[43];
                merges_so_far = coderesults[44];
                moves_where_merged = coderesults[45];
                merges_before_now = coderesults[46];
                game_vars = coderesults[47];
                modifier_vars = coderesults[48];
                possibleOverChecked = coderesults[49];
                displayGrid();
            }
            
        }
        else if (codebits[1] == "1.0") {
            coderesults.push(Number(window.atob(codebits[2]))); //coderesults[0] is width
            if (isNaN(coderesults[0]) || coderesults[0] < 1 || (coderesults[0] % 1) != 0) throw "Invalid width";
            coderesults.push(Number(window.atob(codebits[3]))); //coderesults[1] is height
            if (isNaN(coderesults[1]) || coderesults[1] < 1 || (coderesults[1] % 1) != 0) throw "Invalid height";
            coderesults.push(Number(window.atob(codebits[4]))); //coderesults[2] is TileNumAmount
            if (isNaN(coderesults[2]) || coderesults[2] < 1 || (coderesults[2] % 1) != 0) throw "Invalid amount of tile tier numbers";
            coderesults.push(JSON.parse(window.atob(codebits[5]))); //coderesults[3] is TileTypes
            coderesults.push(JSON.parse(window.atob(codebits[6]))); //coderesults[4] is MergeRules
            coderesults.push(JSON.parse(window.atob(codebits[7]))); //coderesults[5] is TileSpawns
            coderesults.push(JSON.parse(window.atob(codebits[8]))); //coderesults[6] is startingGrid
            coderesults.push(JSON.parse(window.atob(codebits[9]))); //coderesults[7] is winConditions
            coderesults.push(Number(window.atob(codebits[10]))); //coderesults[8] is winRequirement
            coderesults.push(Number(window.atob(codebits[11]))); //coderesults[9] is slideAmount
            if (codebits[12] == "t") coderesults.push(true); //coderesults[10] is multiMerge
            else if (codebits[12] == "f") coderesults.push(false);
            else throw "Invalid multiMerge";
            coderesults.push(window.atob(codebits[13])); //coderesults[11] is --background-color
            coderesults.push(window.atob(codebits[14])); //coderesults[12] is --grid-color
            coderesults.push(window.atob(codebits[15])); //coderesults[13] is --tile-color
            coderesults.push(window.atob(codebits[16])); //coderesults[14] is --text-color
            coderesults.push(window.atob(codebits[17])); //coderesults[15] is the rules text
            if (codebits[18] == "t") coderesults.push(true); //coderesults[16] is whether the amount of discovered tiles is displayed
            else if (codebits[18] == "f") coderesults.push(false);
            else throw "Invalid discovered display";
            if (codebits[19] == "t") coderesults.push(true); //coderesults[17] is whether the amount of winning tiles is displayed
            else if (codebits[19] == "f") coderesults.push(false);
            else throw "Invalid winning display";
            coderesults.push(window.atob(codebits[20])); //coderesults[18] is spawnLocation
            coderesults.push(Number(window.atob(codebits[21]))); //coderesults[19] is startTileAmount
            coderesults.push(Number(window.atob(codebits[22]))); //coderesults[20] is randomTileAmount
            coderesults.push(JSON.parse(window.atob(codebits[23]))); //coderesults[21] is directions
            coderesults.push(Number(window.atob(codebits[24]))); //coderesults[22] is nextTiles
            if (codebits[25] == "t") coderesults.push(true); //coderesults[23] is whether the amount of moves so far is displayed
            else if (codebits[25] == "f") coderesults.push(false);
            else throw "Invalid moves display";
            if (codebits[26] == "t") coderesults.push(true); //coderesults[24] is whether the amount of merges so far is displayed
            else if (codebits[26] == "f") coderesults.push(false);
            else throw "Invalid moves display";
            coderesults.push(JSON.parse(window.atob(codebits[27]))); //coderesults[25] is game_vars
            coderesults.push(JSON.parse(window.atob(codebits[28]))); //coderesults[26] is spawnConditions
            if (codebits[0] == "@2048PowCompGame") {
                coderesults.push(JSON.parse(window.atob(codebits[29]))); //coderesults[27] is Grid
                coderesults.push(Number(window.atob(codebits[30]))); //coderesults[28] is score
                coderesults.push(Number(window.atob(codebits[31]))); //coderesults[29] is won
                coderesults.push(JSON.parse(window.atob(codebits[32]))); //coderesults[30] is discoveredTiles
                coderesults.push(JSON.parse(window.atob(codebits[33]))); //coderesults[31] is discoveredWinning
                coderesults.push(JSON.parse(window.atob(codebits[34]))); //coderesults[32] is SpawnBoxes
                coderesults.push(JSON.parse(window.atob(codebits[35]))); //coderesults[33] is directionsAvailable
                coderesults.push(JSON.parse(window.atob(codebits[36]))); //coderesults[34] is spawnConveyor
                coderesults.push(Number(window.atob(codebits[37]))); //coderesults[35] is moves_so_far
                coderesults.push(Number(window.atob(codebits[38]))); //coderesults[36] is merges_so_far
                coderesults.push(Number(window.atob(codebits[39]))); //coderesults[37] is moves_where_merged
                coderesults.push(Number(window.atob(codebits[40]))); //coderesults[38] is merges_before_now
            }
            //If we've gotten this far, the import is a success, so it's time to do the actual importing
            width = coderesults[0];
            height = coderesults[1];
            TileNumAmount = coderesults[2];
            TileTypes = coderesults[3];
            for (let t = 0; t < TileTypes.length; t++) {
                if (TileTypes[t].length > 4) TileTypes[t].splice(4, 0, "none");
                if (TileTypes[t].length > 7) for (let i = 7; i < TileTypes[t].length; i++) TileTypes[t][i].unshift("Innerscript");
            }
            updateAtSign(TileTypes, 1.0);
            MergeRules = coderesults[4];
            updateAtSign(MergeRules, 1.0);
            startTileSpawns = coderesults[5];
            startingGrid = coderesults[6];
            updateAtSign(startingGrid, 1.0);
            winConditions = coderesults[7];
            winRequirement = coderesults[8];
            multiMerge = coderesults[10];
            document.documentElement.style.setProperty("--background-color", coderesults[11]);
            document.documentElement.style.setProperty("--grid-color", coderesults[12]);
            document.documentElement.style.setProperty("--tile-color", coderesults[13]);
            document.documentElement.style.setProperty("--text-color", coderesults[14]);
            document.getElementById("rules_text").innerHTML = coderesults[15];
            statBoxes = [];
            if (coderesults[23]) statBoxes.push(["Moves", "@Moves"]);
            if (coderesults[16]) statBoxes.push(["Discovered Tiles", ["@DiscTiles", "arr_length"]]);
            statBoxes.push(["Score", "@Score"]);
            if (coderesults[17]) statBoxes.push(["Discovered Winning Tiles", ["@DiscWinning", "arr_length"]]);
            if (coderesults[24]) statBoxes.push(["Merges", "@Merges"]);
            spawnLocation = coderesults[18];
            startTileAmount = coderesults[19];
            randomTileAmount = coderesults[20];
            directions = coderesults[21];
            for (let d = 0; d < directions.length; d++) {
                directions[d][0].push(coderesults[9], 0, [1, true, true, true]);
                directions[d].splice(3, 0, directions[d][2]);
            }
            nextTiles = coderesults[22];
            start_game_vars = coderesults[25];
            spawnConditions = coderesults[26];
            scripts = [];
            loseConditions = [];
            loseRequirement = false;
            winPriority = true;
            postgameAllowed = true;
            auto_directions = [];
            start_modifier_vars = [];
            forcedSpawns = [];
            gamemode = 0;
            startGame();
            if (codebits[0] == "@2048PowCompGame") {
                Grid = coderesults[27];
                updateAtSign(Grid, 1.0);
                score = coderesults[28];
                won = coderesults[29];
                discoveredTiles = coderesults[30];
                discoveredWinning = coderesults[31];
                SpawnBoxes = coderesults[32];
                directionsAvailable = coderesults[33];
                spawnConveyor = coderesults[34];
                moves_so_far = coderesults[35];
                merges_so_far = coderesults[36];
                moves_where_merged = coderesults[37];
                merges_before_now = coderesults[38];
                discoveredLosing = [];
                manual_moves_so_far = moves_so_far;
                possibleOverChecked = false;
                displayGrid();
            }
            
        }
        else throw "Invalid update";
    }
    catch (err) {
        if (typeof err == "object") {
            document.getElementById("save_code_box").value = "There was an error with importing your save code: " + err.name + " " + err.message;
        }
        else document.getElementById("save_code_box").value = "There was an error with importing your save code: " + err;
    }
}

//Testing
function output(output) { //Outputs whatever text is given as a new paragraph on the document
    let literal = false;
    if (arguments.length > 1) literal = arguments[1];
    let testP = document.createElement("p");
    if (literal) {
        let textT = document.createTextNode(boxArrayString(output));
        testP.appendChild(textT);
    }
    else testP.innerHTML = boxArrayString(output);
    testP.classList.add("output");
    document.body.appendChild(testP);
}

function boxArrayString(arr) { // Turns an array into a string, but with brackets aroung it
    let narr = structuredClone(arr);
    if (Array.isArray(narr)) {
        for (let e = 0; e < narr.length; e++) narr[e] = boxArrayString(narr[e]);
        return "[" + narr + "]"; 
    }
    else return String(arr);
}

