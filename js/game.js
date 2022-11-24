
'use strict'

const MINE = '<img src="img/mine.png"></img>'
const FLAG = '<img src="img/flag.png"></img>'
const SMILEY = '<img src="img/smiley-face.png"></img>'
const SMILEYDEAD = '<img src="img/dead-face.png"></img>'
const SMILEYWIN = '<img src="img/smiley-win.png"></img>'


var gBoard
var gGame
var gLevel
var gFirstClick
var gIsHint
var gBoardUndo


function initGame() {
    gBoard = []
    gGame = { isOn: false, shownCount: 0, markedCount: 0, secsPassed: 0, mineSpotted: 0, flagCount: 0, lifeCount: 3, hint: 3 }
    document.addEventListener('contextmenu', event => event.preventDefault());
    gLevel = { size: null, mines: null }
}

function playGame(size, mines) {
    gBoardUndo = []
    gBoard = []
    gGame.isOn = true
    gGame.markedCount = 0
    gGame.mineSpotted = 0
    gGame.shownCount = 0
    gGame.secsPassed = 0
    gGame.lifeCount = 3
    gGame.hint = 3
    gFirstClick = true
    gLevel = {
        size,
        mines
    }
    gGame.flagCount = mines
    console.log('gLevel:', gLevel)
    resetHelpers()
    gBoard = buildBoard(gLevel)
    setgBoardUndoPoint()
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
            var classColor = ''
            //Type of cell
            if (currCell.isShown) {
                className = 'shown'
                strTEXT = ''
            }
            if (currCell.isShown && currCell.minesAroundCount > 0) {
                className = 'shown'
                strTEXT = +currCell.minesAroundCount
                classColor = colorNums(strTEXT)
            }
            if (currCell.isMine && currCell.isShown) {
                className += ' mine'
                strTEXT = MINE
            }
            if (currCell.isMarked) {
                className = 'marked'
                strTEXT = FLAG
            }
            strHTML += `<td class="cell-${i}-${j} ${className} ${classColor}" data-i="${i}" data-j="${j}" onmouseup="CellClicked(this, ${i},${j},event)">${strTEXT}</td>`
        }
        strHTML += '</tr>'
    }
    const elBoard = document.querySelector('.game-cells')
    elBoard.innerHTML = strHTML
    colorNums(strTEXT, elBoard)
}

function CellClicked(elCell, i, j, ev) {
    var cell = gBoard[i][j]
    if (!gGame.isOn) return
    setgBoardUndoPoint()
    switch (ev.button) {
        case 0:
            if (gIsHint) {
                showHint(elCell, i, j)
                return
            }
            if (cell.isMarked || cell.isShown) return
            cellExposed(cell, i, j)
            break
        case 2:
            if (cell.isShown) return
            cellMarked(cell)
            console.log('gGame.markedCount:', gGame.markedCount)
            console.log('gGame.mineSpotted:', gGame.mineSpotted)
            break
    }
    console.log('gGame.showCount:', gGame.shownCount)
    
    renderBoard(gBoard)
    checkGameOver(elCell, i, j)
    renderInfo()
}

function spawnMines(board, amount, i, j) {
    const minesIdx = getShuffledIdxs(board)
    var minesAmount
    console.log(minesIdx)
    for (var d = 0; d < amount; d++) {
        const posI = minesIdx[d].i
        const posJ = minesIdx[d].j
        if (posI !== i && posJ !== j) {
            board[posI][posJ].isMine = true
        } else {
            amount++
        }
    }
    setMinesNegsCount(gBoard)
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
    gGame.secsPassed = parseInt(secsElapsed)
    const elTimer = document.querySelector('.timer')
    var zeroFix = '00'
    if (gGame.secsPassed >= 10) zeroFix = '0'
    if (gGame.secsPassed >= 100) zeroFix = ''
    elTimer.innerText = `${zeroFix}${gGame.secsPassed}`
}


function renderInfo() {
    renderFlagCount()


}
function renderLifeCount() {
    const ellive = document.querySelector(`.live-${gGame.lifeCount}`)
    ellive.innerHTML = SMILEYDEAD
}

function renderFlagCount() {
    const elFlagCount = document.querySelector('.flags-count')
    var zeroFix = '0'
    if (gGame.flagCount >= 10) zeroFix = ''
    elFlagCount.innerText = `${zeroFix}${+gGame.flagCount}`
}

function updateFlagCount(cell) {
    if (cell.isMarked) {
        gGame.markedCount++
        if (cell.isMine) gGame.mineSpotted++
    } else {
        gGame.markedCount--
        if (cell.isMine)
            gGame.mineSpotted--
    }
    gGame.flagCount = gLevel.mines - gGame.markedCount
}

function checkGameOver(elCell, i, j) {
    const cell = gBoard[i][j]
    if (cell.isMine && cell.isShown) gameOver(elCell)
    if (gGame.mineSpotted === gLevel.mines && gGame.shownCount === gLevel.size ** 2 - gLevel.mines) victory()
}

function gameOver(elCell) {
    if (gGame.lifeCount > 0) {
        renderLifeCount()
        gGame.lifeCount--
        if (gGame.lifeCount === 0) gameOver()
        return
    }
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
    clearInterval(gGame.timerInterval)
    for (var i = 0; i < 3; i++) {
        const ellive = document.querySelector(`.live-${i + 1}`)
        ellive.innerHTML = SMILEYWIN
    }
}

function restartCurrGame() {
    playGame(gLevel.size, gLevel.mines)
}

function cellExposed(cell, i, j) {


    if (gFirstClick) {
        startTimer()
        spawnMines(gBoard, gLevel.mines, i, j)
        gFirstClick = false

    }
    if (cell.minesAroundCount > 0 && !cell.isMine) {
        cell.isShown = true
    } else if (cell.minesAroundCount === 0 && !cell.isMine) {
        expandShown(gBoard, i, j); return
    }
    if (cell.isMine) {
        gGame.mineSpotted++
        cell.isShown = true
        console.log('gGame.mineSpotted:', gGame.mineSpotted)
    }
    if (!cell.isMine) gGame.shownCount++
}

function cellMarked(cell) {

    if (gGame.flagCount <= 0 && cell.isMarked) {
        cell.isMarked = false
        updateFlagCount(cell)
        return
    }
    if (gGame.flagCount === 0) return
    cell.isMarked = (cell.isMarked) ? false : true
    updateFlagCount(cell)
}

function expandShown(board, i, j) {
    if (i < 0 || i > board.length - 1 || j < 0 || j > board.length - 1) return

    console.log('expand')
    console.log(i, j)
    console.log('board[i][j].isShown:', board[i][j].isShown)
    console.log('board[i][j].minesAroundCount:', board[i][j].minesAroundCount)
    if (board[i][j].minesAroundCount === 0 && !board[i][j].isShown) {
        console.log('exppand loop')
        board[i][j].isShown = true;
        gGame.shownCount++
        expandShown(board, i + 1, j)
        expandShown(board, i - 1, j)
        expandShown(board, i, j + 1)
        expandShown(board, i, j - 1)
    } else {
        return;
    }
}

function getHint(id) {
    if (gIsHint === id) {
        gIsHint = false
        const elHint = document.querySelector(`.hint-${id}`)
        elHint.classList.remove('smaller')
        return

    }
    console.log(id)
    const elHint = document.querySelector(`.hint-${id}`)
    elHint.classList.add('smaller')
    gIsHint = id //true

}
function showHint(elcell, i, j) {
    const gBoardCpy = structuredClone(gBoard)
    for (var y = i - 1; y <= i + 1; y++) {
        if (y < 0 || y >= gBoard.length) continue
        for (var x = j - 1; x <= j + 1; x++) {
            if (x < 0 || x >= gBoard.length) continue
            gBoardCpy[y][x].isShown = true
            console.log(gBoardCpy)
        }
    }
    renderBoard(gBoardCpy)
    const hintTimer = setTimeout(() => {
        renderBoard(gBoard)
        clearTimeout(hintTimer)
    }, 1000);
    console.log('gIsHint:', gIsHint)
    hideElement(`.hint-${gIsHint}`)
    gIsHint = false
}

function setgBoardUndoPoint() {
    const gBoardCpy = structuredClone(gBoard)
    gBoardUndo.push(gBoardCpy)
    console.log('gBoardUndo:', gBoardUndo)
}

//not complete still buggy
function undo() { 
    if (gFirstClick||!gGame.isOn) return
    if (gGame.shownCount > 2) {
        gBoard = gBoardUndo.pop()
        renderBoard(gBoard)
        console.log('gBoardUndo:', gBoardUndo)
    }
    if(gBoardUndo.length===0){
        gFirstClick=true
    }
}

function resethints() {
    for (var i = 0; i < 3; i++) {
        showElement(`.hint-${i + 1}`)
        const ellive = document.querySelector(`.hint-${i + 1}`)
        ellive.classList.remove('smaller')
    }
}

function resetHelpers() {
    resethints()
    resetLife()
}

function resetLife() {
    for (var i = 0; i < 3; i++) {
        const ellive = document.querySelector(`.live-${i + 1}`)
        ellive.innerHTML = SMILEY
    }
}




function colorNums(num) {
    switch (num) {
        case 1:
            return "blue"
        case 2:
            return "green"
        case 3:
            return "red"
        case 4:
            return "purple"
    }

}