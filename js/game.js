
'use strict'

const MINE = '<img src="img/mine.png"></img>'
const FLAG = '<img src="img/flag.png"></img>'


var gBoard
var gGame
var gLevel


function initGame() {
    gBoard = []
    gGame = { isOn: false, shownCount: 0, markedCount: 0, secsPassed: 0 }
    document.addEventListener('contextmenu', event => event.preventDefault());



}

function playGame(size, mines) {
    gGame.isOn = true
    gLevel = {
        size,
        mines
    }
    console.log('gLevel:', gLevel)
    gBoard = buildBoard(gLevel)
    console.log('gBoard:', gBoard)
    renderBoard(gBoard)
    spawnMines(gBoard, mines)
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
                minesAroundCount:0
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
            var strTEXT=''
            //Type of cell
            if (currCell.isShown) {
                className = 'shown'
                strTEXT = ''
            }

            if (currCell.isShown&&currCell.minesAroundCount>0) {
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
    switch (ev.button) {
        case 0:
            cell.isShown = true
            break
        case 2:
            cell.isMarked = (cell.isMarked) ? false : true

            break
    }
    setMinesNegsCount(gBoard)
    renderBoard(gBoard)




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
        board[posI][posJ].isMine = true

    }



}

function cellMarked(elCell) {

}

function checkGameOver() {

}

function expandShown(board, elCell, i, j) { }

function setMinesNegsCount(board) {
    
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board.length; j++) {
            const cell = board[i][j]
            cell.minesAroundCount = countNegs({ i: i, j: j })
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