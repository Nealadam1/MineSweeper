
'use strict'

const MINE = '<img src="img/mine.png"></img>'
const FLAG = '<img src="img/flag.png"></img>'


var gBoard
var gGame
var gLevel
var gFirstClick


function initGame() {
    gBoard = []
    gGame = { isOn: false, shownCount: 0, markedCount: 0, secsPassed: 0, mineSpotted: 0 }
    document.addEventListener('contextmenu', event => event.preventDefault());



}

function playGame(size, mines) {
    gBoard = []
    gGame.isOn = true
    gGame.markedCount = 0
    gGame.mineSpotted = 0
    gGame.shownCount = 0
    gGame.secsPassed = 0
    gFirstClick = true

    gLevel = {
        size,
        mines
    }
    console.log('gLevel:', gLevel)
    gBoard = buildBoard(gLevel)
    console.log('gBoard:', gBoard)
    clearInterval(gGame.timerInterval)
    renderBoard(gBoard)
    renderInfo()

}

function buildBoard(level) {
    const board = []
    for (var i = 0; i < level.size; i++) {
        board.push([])
        for (var j = 0; j < level.size; j++) {
            const cell = {
                isShown: false,
                isMine: false,
                isMarked: false,
                minesAroundCount: 0
            }
            board[i][j] = cell
        }
    }
    return board
}

function renderBoard(board) {
    var strHTML = ''
    for (var i = 0; i < board.length; i++) {
        strHTML += '<tr>'
        for (var j = 0; j < board[0].length; j++) {
            const currCell = board[i][j]
            var className = ''
            var strTEXT = ''
            //Type of cell
            if (currCell.isShown) {
                className = 'shown'
                strTEXT = ''
            }

            if (currCell.isShown && currCell.minesAroundCount > 0) {
                className = 'shown'
                strTEXT = +currCell.minesAroundCount
            }

            if (currCell.isMine && currCell.isShown) {
                className += ' mine'
                strTEXT = MINE

            }
            if (currCell.isMarked) {
                className = 'marked'
                strTEXT = FLAG

            }
            strHTML += `<td class="cell ${className}" data-i="${i}" data-j="${j}" onmouseup="CellClicked(this, ${i},${j},event)">${strTEXT}</td>`
        }
        strHTML += '</tr>'
    }
    const elBoard = document.querySelector('.game-cells')
    elBoard.innerHTML = strHTML

}

function CellClicked(elCell, i, j, ev) {
    var cell = gBoard[i][j]
    if (!gGame.isOn) return

    if (gFirstClick) {
        startTimer()
        cell.isShown = true
        spawnMines(gBoard, gLevel.mines)
        gFirstClick = false

    }
    switch (ev.button) {
        case 0:
            if (cell.isMarked) return
            if (cell.minesAroundCount > 0) {
                cell.isShown = true
            } else if (cell.minesAroundCount===0){
                expandShown(gBoard, i, j)
            }

            gGame.shownCount++

            break
        case 2:
            cell.isMarked = (cell.isMarked) ? false : true
            if (cell.isMarked) {
                gGame.markedCount++
                if (cell.isMine) gGame.mineSpotted++
            } else {
                gGame.markedCount--
                if (cell.isMine)
                    gGame.mineSpotted--
            }

            console.log('gGame.markedCount:', gGame.markedCount)
            console.log('gGame.mineSpotted:', gGame.mineSpotted)

            break
    }
    setMinesNegsCount(gBoard)
    renderInfo()
    renderBoard(gBoard)
    checkGameOver(elCell, i, j)




}
// function renderCell(location, value) {
//     // Select the elCell and set the value
//     const elCell = document.querySelector(`.cell-${location.i}-${location.j}`)
//     elCell.innerHTML = value
// }

function spawnMines(board, amount) {
    const minesIdx = getShuffledIdxs(board)
    console.log(minesIdx)
    for (var d = 0; d < amount; d++) {
        const posI = minesIdx[d].i
        const posJ = minesIdx[d].j
        if (!board[posI][posJ].isShown)
            board[posI][posJ].isMine = true

    }



}

function cellMarked(elCell) {

}

function checkGameOver(elCell, i, j) {
    const cell = gBoard[i][j]
    if (cell.isMine && cell.isShown) gameOver(elCell)
    if (gGame.mineSpotted === gLevel.mines && gGame.shownCount === gLevel.size ** 2 - gLevel.mines) victory()





}

function gameOver(elCell) {
    console.log('gameover')
    clearInterval(gGame.timerInterval)
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard.length; j++) {
            if (gBoard[i][j].isMine) gBoard[i][j].isShown = true
        }
    }
    console.log(gBoard)
    gGame.isOn = false
    renderBoard(gBoard)

}
function victory() {
    console.log('win')
}

function expandShown(board, i, j) {
    if(i<0 || i> board.length-1||j<0||j>board.length-1) return
    console.log('expand')
    console.log(i,j)
    console.log('board[i][j].isShown:', board[i][j].isShown)
    console.log('board[i][j].minesAroundCount:', board[i][j].minesAroundCount)
    if (board[i][j].minesAroundCount=== 0 && !board[i][j].isShown) {
        console.log('exppand loop')
        board[i][j].isShown = true;
        expandShown(board, i + 1, j)
        expandShown(board, i - 1, j)
        expandShown(board, i, j + 1)
        expandShown(board, i, j - 1)
    } else {
        return;
    }
}

function setMinesNegsCount(board) {
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board.length; j++) {
            const cell = board[i][j]
            cell.minesAroundCount = +countNegs({ i: i, j: j })
        }
    }



}

function countNegs(pos) {
    var negMines = 0
    for (var i = pos.i - 1; i <= pos.i + 1; i++) {
        if (i < 0 || i >= gBoard.length) continue
        for (var j = pos.j - 1; j <= pos.j + 1; j++) {
            if (j < 0 || j >= gBoard[i].length) continue
            if (i === pos.i && j === pos.j) continue
            if (gBoard[i][j].isMine) negMines++
        }
    }
    return negMines
}
function startTimer() {
    const startTime = Date.now()
    gGame.timerInterval = setInterval(
        () => updateTime(startTime),
        1000
    )
}

function updateTime(startTime) {
    const currTime = Date.now()
    const elapsed = currTime - startTime
    const secsElapsed = elapsed / 1000
    console.log('elapsed:', secsElapsed)

    gGame.secsPassed = parseInt(secsElapsed)

    const elTimer = document.querySelector('.timer')

    var zeroFix = '00'
    if (gGame.secsPassed >= 10) zeroFix = '0'
    if (gGame.secsPassed >= 100) zeroFix = ''
    elTimer.innerText = `${zeroFix}${gGame.secsPassed}`

    // if (gGame.secsPassed <= gMaxCount) renderTime(gGame.secsPassed)
    //still count towards best time but not update past MAX_TIME
}


function renderInfo(){
    renderFlagCount()
    
}

function renderFlagCount(){
    const elFlagCount=document.querySelector('.flag-count')
    

}
