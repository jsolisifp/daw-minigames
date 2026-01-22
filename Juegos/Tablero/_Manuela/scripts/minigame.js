/////////////////////////
//       MINIGAME     //
////////////////////////


var objectTypeTile = 0;
var objectTypeController = 1;
var objectTypeMusic = 2;

// configuracion del tablero
var puzzleColumns = 6;
var puzzleRows = 6;
var puzzleTileSize = 80;

// para centrar el puzzle en el canvas
var puzzleOriginX = 210;
var puzzleOriginY = 60;


var puzzleGrid;
var puzzleEmptyRow;
var puzzleEmptyCol;

// contador de movimientos
var moveCount = 0;

// para saber si ya se ha ganado
var gameWon = false;

// temporizador
var gameStartTime = 0;
var elapsedTime = 0;
var timerInterval = null;

// guardar los sonidos
var soundManager = null;


function CreateScene()
{
    var r;
    var c;
    
    
    moveCount = 0;
    gameWon = false;
    UpdateMoveCounter();
    
   
    puzzleGrid = new Array();
    for(r = 0; r < puzzleRows; r++)
    {
        puzzleGrid[r] = new Array();
        for(c = 0; c < puzzleColumns; c++)
        {
            var posX = puzzleOriginX + c * puzzleTileSize;
            var posY = puzzleOriginY + r * puzzleTileSize;
            
            // la ultima casilla es el hueco
            if(r == puzzleRows - 1 && c == puzzleColumns - 1)
            {
                puzzleGrid[r][c] = -1;
                puzzleEmptyRow = r;
                puzzleEmptyCol = c;
            }
            else
            {
                
                var index = CreateObject("tile", objectTypeTile, posX, posY, puzzleTileSize, puzzleTileSize);
                var o = objects[index];
                o.row = r;
                o.col = c;
                puzzleGrid[r][c] = index;
            }
        }
    }
    
 
    CreateObject("controller", objectTypeController, 0, 0, 0, 0);
    

    CreateObject("sounds", objectTypeMusic, 0, 0, 0, 0);
}


function StartObject(index)
{
    var o = objects[index];
    
    if(o.type == objectTypeTile)
    {
        
        o.sprite = CreateSprite("LaQueSeAvecina.webp");
        var s = GetSprite(o.sprite);
        
        
        o.correctRow = o.row;
        o.correctCol = o.col;
        
        
        s.style.objectPosition =
            (-o.correctCol * puzzleTileSize) + "px " +
            (-o.correctRow * puzzleTileSize) + "px";
        
        o.collider = CreateCollider(bodyTypeKinematic, false);
    }
    else if(o.type == objectTypeController)
    {
        
        ShufflePuzzle();
        
        
        StartTimer();
    }
    else if(o.type == objectTypeMusic)
    {
        
        o.popSound = CreateSound("pop.mp3", false);      
        o.dingSound = CreateSound("ding.wav", false);    
        o.shimmerSound = CreateSound("shimmer.wav", false); 
        
       
        soundManager = o;
    }
}


function UpdateObject(index)
{
    var o = objects[index];
    
    if(o.type == objectTypeController)
    {
        
        if(inputLeftDown)
        {
            PuzzleMove(-1, 0);
        }
        if(inputRightDown)
        {
            PuzzleMove(1, 0);
        }
        if(inputUpDown)
        {
            PuzzleMove(0, -1);
        }
        if(inputDownDown)
        {
            PuzzleMove(0, 1);
        }
    }
    else if(o.type == objectTypeMusic){}
}



function OnObjectClicked(object)
{
    
    if(gameWon)
    {
        return;
    }
    
    
    if(object.type != objectTypeTile)
    {
        return;
    }
    
    var moved = false;
    var row = object.row;
    var col = object.col;
    
    
    if(row == puzzleEmptyRow && col != puzzleEmptyCol)
    {
        var c;
        
        if(col < puzzleEmptyCol)
        {
            
            for(c = puzzleEmptyCol - 1; c >= col; c--)
            {
                var tileIndex = puzzleGrid[row][c];
                if(tileIndex >= 0)
                {
                    PuzzleSetTilePosition(tileIndex, row, c + 1);
                    puzzleGrid[row][c + 1] = tileIndex;
                }
            }
            puzzleGrid[row][col] = -1;
            puzzleEmptyCol = col;
            moved = true;
        }
        
        else if(col > puzzleEmptyCol)
        {
            for(c = puzzleEmptyCol + 1; c <= col; c++)
            {
                var tileIndex2 = puzzleGrid[row][c];
                if(tileIndex2 >= 0)
                {
                    PuzzleSetTilePosition(tileIndex2, row, c - 1);
                    puzzleGrid[row][c - 1] = tileIndex2;
                }
            }
            puzzleGrid[row][col] = -1;
            puzzleEmptyCol = col;
            moved = true;
        }
    }
    
    else if(col == puzzleEmptyCol && row != puzzleEmptyRow)
    {
        var r;
        
        if(row < puzzleEmptyRow)
        {
            for(r = puzzleEmptyRow - 1; r >= row; r--)
            {
                var tileIndex3 = puzzleGrid[r][col];
                if(tileIndex3 >= 0)
                {
                    PuzzleSetTilePosition(tileIndex3, r + 1, col);
                    puzzleGrid[r + 1][col] = tileIndex3;
                }
            }
            puzzleGrid[row][col] = -1;
            puzzleEmptyRow = row;
            moved = true;
        }
        
        else if(row > puzzleEmptyRow)
        {
            for(r = puzzleEmptyRow + 1; r <= row; r++)
            {
                var tileIndex4 = puzzleGrid[r][col];
                if(tileIndex4 >= 0)
                {
                    PuzzleSetTilePosition(tileIndex4, r - 1, col);
                    puzzleGrid[r - 1][col] = tileIndex4;
                }
            }
            puzzleGrid[row][col] = -1;
            puzzleEmptyRow = row;
            moved = true;
        }
    }
    
    if(moved)
    {
        
        moveCount++;
        UpdateMoveCounter();
        
        
        var algunaCorrecta = false;
        
        
        if(row == puzzleEmptyRow)
        {
            var colInicio = Math.min(col, puzzleEmptyCol);
            var colFin = Math.max(col, puzzleEmptyCol);
            for(var cc = colInicio; cc <= colFin; cc++)
            {
                var indice = puzzleGrid[row][cc];
                if(indice >= 0)
                {
                    var ficha = objects[indice];
                    
                    if(ficha.row == ficha.correctRow && ficha.col == ficha.correctCol)
                    {
                        algunaCorrecta = true;
                        break;
                    }
                }
            }
        }
        
        else if(col == puzzleEmptyCol)
        {
            var rowInicio = Math.min(row, puzzleEmptyRow);
            var rowFin = Math.max(row, puzzleEmptyRow);
            for(var rr = rowInicio; rr <= rowFin; rr++)
            {
                var indice2 = puzzleGrid[rr][col];
                if(indice2 >= 0)
                {
                    var ficha2 = objects[indice2];
                    
                    if(ficha2.row == ficha2.correctRow && ficha2.col == ficha2.correctCol)
                    {
                        algunaCorrecta = true;
                        break;
                    }
                }
            }
        }
        
        
        if(soundManager)
        {
            if(algunaCorrecta)
            {
                PlaySound(soundManager.dingSound);
            }
            else
            {
                PlaySound(soundManager.popSound);
            }
        }
        else
        {
            console.log("ERROR: soundManager es null");
        }
        
        // comprobar si se ha ganado
        if(CheckVictory())
        {
            ShowVictory();
        }
    }
}


function OnObjectCollision(object, otherObject){}



function UpdateMoveCounter()
{
    var counterElement = document.getElementById("movesNumber");
    if(counterElement)
    {
        counterElement.textContent = moveCount;
    }
}

// empezar el temporizador
function StartTimer()
{
    gameStartTime = Date.now();
    elapsedTime = 0;
    
   
    timerInterval = setInterval(function()
    {
        if(!gameWon)
        {
            elapsedTime = Math.floor((Date.now() - gameStartTime) / 1000);
            UpdateTimerDisplay();
        }
    }, 1000);
}

function StopTimer()
{
    if(timerInterval)
    {
        clearInterval(timerInterval);
        timerInterval = null;
    }
}


function UpdateTimerDisplay()
{
    var minutes = Math.floor(elapsedTime / 60);
    var seconds = elapsedTime % 60;
    
   
    var timeString = "";
    if(minutes < 10) { timeString += "0"; }
    timeString += minutes + ":";
    if(seconds < 10) { timeString += "0"; }
    timeString += seconds;
    
    var timerElement = document.getElementById("timerNumber");
    if(timerElement)
    {
        timerElement.textContent = timeString;
    }
}


function GetFormattedTime()
{
    var minutes = Math.floor(elapsedTime / 60);
    var seconds = elapsedTime % 60;
    
    var timeString = "";
    if(minutes < 10) { timeString += "0"; }
    timeString += minutes + ":";
    if(seconds < 10) { timeString += "0"; }
    timeString += seconds;
    
    return timeString;
}

// comprobar si el puzzle esta resuelto
function CheckVictory()
{
    
    for(var r = 0; r < puzzleRows; r++)
    {
        for(var c = 0; c < puzzleColumns; c++)
        {
            var index = puzzleGrid[r][c];
            
            
            if(index == -1)
            {
                if(r != puzzleRows - 1 || c != puzzleColumns - 1)
                {
                    return false;
                }
            }
            else
            {
                
                var o = objects[index];
                if(o.row != o.correctRow || o.col != o.correctCol)
                {
                    return false;
                }
            }
        }
    }
    
    return true;
}

// mostrar la pantalla de victoria
function ShowVictory()
{
    gameWon = true;
    
    
    StopTimer();
    
   
    if(soundManager)
    {
        PlaySound(soundManager.shimmerSound);
    }
    
    var finalMovesElement = document.getElementById("finalMoves");
    if(finalMovesElement)
    {
        finalMovesElement.textContent = moveCount;
    }
    
    var finalTimeElement = document.getElementById("finalTime");
    if(finalTimeElement)
    {
        finalTimeElement.textContent = GetFormattedTime();
    }
    

    var victoryScreen = document.getElementById("victoryScreen");
    if(victoryScreen)
    {
        victoryScreen.style.display = "flex";
    }
}


function PuzzleSetTilePosition(index, row, col)
{
    var o = objects[index];
    o.posX = puzzleOriginX + col * puzzleTileSize;
    o.posY = puzzleOriginY + row * puzzleTileSize;
    o.row = row;
    o.col = col;
}


function PuzzleMoveInternal(dx, dy, playSound)
{
    
    if(gameWon)
    {
        return;
    }
    
    var newRow = puzzleEmptyRow + dy;
    var newCol = puzzleEmptyCol + dx;
    
    
    if(newRow < 0 || newRow >= puzzleRows || newCol < 0 || newCol >= puzzleColumns)
    {
        return;
    }
    
    var tileIndex = puzzleGrid[newRow][newCol];
    if(tileIndex >= 0)
    {
        
        PuzzleSetTilePosition(tileIndex, puzzleEmptyRow, puzzleEmptyCol);
        puzzleGrid[puzzleEmptyRow][puzzleEmptyCol] = tileIndex;
        puzzleGrid[newRow][newCol] = -1;
        puzzleEmptyRow = newRow;
        puzzleEmptyCol = newCol;
        
        if(playSound)
        {
            
            moveCount++;
            UpdateMoveCounter();
            
            
            if(soundManager)
            {
                var ficha = objects[tileIndex];
                
                if(ficha.row == ficha.correctRow && ficha.col == ficha.correctCol)
                {
                    PlaySound(soundManager.dingSound);
                }
                else
                {
                    PlaySound(soundManager.popSound);
                }
            }
            else
            {
                console.log("ERROR: soundManager es null en PuzzleMoveInternal");
            }
            
            
            if(CheckVictory())
            {
                ShowVictory();
            }
        }
    }
}


function PuzzleMove(dx, dy)
{
    PuzzleMoveInternal(dx, dy, true);
}


function PuzzleMoveNoSound(dx, dy)
{
    PuzzleMoveInternal(dx, dy, false);
}


function ShufflePuzzle()
{
    var i;
    
    for(i = 0; i < 200; i++)
    {
        var dir = UtilsRandomRangeInt(0, 4);
        if(dir == 0)
        {
            PuzzleMoveNoSound(-1, 0);
        }
        else if(dir == 1)
        {
            PuzzleMoveNoSound(1, 0);
        }
        else if(dir == 2)
        {
            PuzzleMoveNoSound(0, -1);
        }
        else
        {
            PuzzleMoveNoSound(0, 1);
        }
    }
}