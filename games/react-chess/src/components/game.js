import React from 'react';
import ReactDOM from 'react-dom';

import '../index.css';
import Board from './board.js';
import FallenSoldierBlock from './fallen-soldier-block.js';
import initialiseChessBoard from '../helpers/board-initialiser.js';
import Bishop from '../pieces/bishop.js';
import Knight from '../pieces/knight.js';
import Queen from '../pieces/queen.js';
import Rook from '../pieces/rook.js';

export default class Game extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      squares: initialiseChessBoard(),
      whiteFallenSoldiers: [],
      blackFallenSoldiers: [],
      player: 1,
      sourceSelection: -1,
      status: '',
      kingStatus: '',
      turn: 'white',
      changePawn: -1
    }
    this.setBishop = this.setBishop.bind(this);
    this.setQueen = this.setQueen.bind(this);
    this.setKnight = this.setKnight.bind(this);
    this.setRook = this.setRook.bind(this);
  }
 
  handleClick(i){
    const squares = this.state.squares.slice();
    
    if(this.state.sourceSelection === -1){
      if(!squares[i] || squares[i].player !== this.state.player){
        this.setState({status: "Wrong selection. Choose player " + this.state.player + " pieces."});
        if (squares[i]) {
          squares[i].style = {...squares[i].style, backgroundColor: ""};
        }
      }
      else{
        squares[i].style = {...squares[i].style, backgroundColor: "RGB(111,143,114)"}; // Emerald from http://omgchess.blogspot.com/2015/09/chess-board-color-schemes.html
        this.setState({
          status: "Choose destination for the selected piece",
          sourceSelection: i
        });
      }
    }else if(this.state.sourceSelection > -1){
      squares[this.state.sourceSelection].style = {...squares[this.state.sourceSelection].style, backgroundColor: ""};
      if(squares[i] && squares[i].player === this.state.player){
        this.setState({
          status: "Wrong selection. Choose valid source and destination again.",
          sourceSelection: -1,
        });
      }else{
        
        const squares = this.state.squares.slice();
        const whiteFallenSoldiers = this.state.whiteFallenSoldiers.slice();
        const blackFallenSoldiers = this.state.blackFallenSoldiers.slice();
        const isDestEnemyOccupied = squares[i]? true : false; 
        const isMovePossible = squares[this.state.sourceSelection].isMovePossible(this.state.sourceSelection, i, isDestEnemyOccupied);
        const srcToDestPath = squares[this.state.sourceSelection].getSrcToDestPath(this.state.sourceSelection, i);
        const isMoveLegal = this.isMoveLegal(srcToDestPath);

        if(isMovePossible && isMoveLegal){
          if(squares[i] !== null){
            if(squares[i].player === 1){
              whiteFallenSoldiers.push(squares[i]);              
            }else{
              blackFallenSoldiers.push(squares[i]);
            }
          }
          squares[i] = squares[this.state.sourceSelection];
          squares[this.state.sourceSelection] = null;
          let player = this.state.player === 1? 2: 1;
          let turn = this.state.turn === 'white'? 'black' : 'white';
          this.setState({
            sourceSelection: -1,
            squares: squares,
            whiteFallenSoldiers: whiteFallenSoldiers,
            blackFallenSoldiers: blackFallenSoldiers,
            player: player,
            status: '',
            turn: turn,
            kingStatus: '',
            changePawn: -1
          });

          //code for check and checkmate
          for (let j=0; j<squares.length; j++){
            if (squares[j] && squares[j].constructor.name==="King" && squares[j].player!==this.state.player){//find the king
              if (squares[i].isMovePossible(i, j, isDestEnemyOccupied) && this.isMoveLegal(srcToDestPath)){//find if enemy threatens the king
                let itisCheck=false;
                srcToDestPath[srcToDestPath.length]=i;

                for (let l=0; l<squares.length; l++){
                  if (squares[l] && squares[l].player!==this.state.player){
                    for (let m=0; m<srcToDestPath.length; m++){
                      if (squares[l].isMovePossible(l, srcToDestPath[m], isDestEnemyOccupied) && this.isMoveLegal(squares[l].getSrcToDestPath(l, srcToDestPath[m])) && squares[l].constructor.name!=="King"){
                        itisCheck=true;
                        break;
                      }
                    }
                  }
                }

                if (itisCheck===false){//find king's possible moves and check if they avoid checkmate
                  let countMoves = 0;

                  if ((!squares[j-1] || j-1===i) && j-1>=0){
                    for (let l=0; l<squares.length; l++){
                      if (squares[l] && squares[l].player===this.state.player && l!==i){
                        const isDestEnemyOccupied = squares[l]? true : false; 
                        if (squares[l].isMovePossible(l, j-1, isDestEnemyOccupied) && this.isMoveLegal(squares[l].getSrcToDestPath(l, j-1))){
                          countMoves++;
                          break;
                        }
                      }
                    }
                  }else
                    countMoves++;
    
                  if ((!squares[j+1] || (j+1)==i) && j+1<64){
                    for (let l=0; l<squares.length; l++){
                      if (squares[l] && squares[l].player===this.state.player && l!==i){
                        const isDestEnemyOccupied = squares[l]? true : false;
                          if (squares[l].isMovePossible(l, j+1, isDestEnemyOccupied) && this.isMoveLegal(squares[l].getSrcToDestPath(l, j+1))){
                            countMoves++;
                            break;
                          }
                        }
                      }
                    }else
                      countMoves++;

                  if ((!squares[j-7] || (j-7)==i) && j-7>=0){
                    for (let l=0; l<squares.length; l++){
                      if (squares[l] && squares[l].player===this.state.player && l!==i){
                        const isDestEnemyOccupied = squares[l]? true : false;
                        if (squares[l].isMovePossible(l, j-7, isDestEnemyOccupied) && this.isMoveLegal(squares[l].getSrcToDestPath(l, j-7))){
                          countMoves++;
                          break;
                        }
                      }
                    }
                  }else
                    countMoves++;

                  if ((!squares[j+7] || (j+7)==i) && j+7<64){
                    for (let l=0; l<squares.length; l++){
                      if (squares[l] && squares[l].player===this.state.player && l!==i){
                        const isDestEnemyOccupied = squares[l]? true : false;
                        if (squares[l].isMovePossible(l, j+7, isDestEnemyOccupied) && this.isMoveLegal(squares[l].getSrcToDestPath(l, j+7))){
                          countMoves++;
                          break;
                        }
                      }
                    }
                  }else
                    countMoves++;

                  if ((!squares[j-8] || (j-8)==i) && j-8>=0){
                    for (let l=0; l<squares.length; l++){
                      if (squares[l] && squares[l].player===this.state.player && l!==i){
                        const isDestEnemyOccupied = squares[l]? true : false;
                        if (squares[l].isMovePossible(l, j-8, isDestEnemyOccupied) && this.isMoveLegal(squares[l].getSrcToDestPath(l, j-8))){
                          countMoves++;
                          break;
                        }
                      }
                    }
                  }else
                    countMoves++;

                  if ((!squares[j+8] || (j+8)==i) && j+8<64){
                    for (let l=0; l<squares.length; l++){
                      if (squares[l] && squares[l].player===this.state.player && l!==i){
                        const isDestEnemyOccupied = squares[l]? true : false;
                        if (squares[l].isMovePossible(l, j+8, isDestEnemyOccupied) && this.isMoveLegal(squares[l].getSrcToDestPath(l, j+8))){
                          countMoves++;
                          break;
                        }
                      }
                    }
                  }else
                    countMoves++;

                  if ((!squares[j-9] || (j-9)==i) && j-9>=0){
                    for (let l=0; l<squares.length; l++){
                      if (squares[l] && squares[l].player===this.state.player && l!==i){
                        const isDestEnemyOccupied = squares[l]? true : false;
                        if (squares[l].isMovePossible(l, j-9, isDestEnemyOccupied) && this.isMoveLegal(squares[l].getSrcToDestPath(l, j-9))){
                          countMoves++;
                          break;
                        }
                      }
                    }
                  }else
                    countMoves++;

                  if ((!squares[j+9] || (j+9)==i) && j+9<64){
                    for (let l=0; l<squares.length; l++){
                      if (squares[l] && squares[l].player===this.state.player && l!==i){
                        const isDestEnemyOccupied = squares[l]? true : false;
                        if (squares[l].isMovePossible(l, j+9, isDestEnemyOccupied) && this.isMoveLegal(squares[l].getSrcToDestPath(l, j+9))){
                          countMoves++;
                          break;
                        }
                      }
                    }
                  }else
                    countMoves++;

                  if (countMoves<8)
                    itisCheck=true;
                }
                                      
                if (itisCheck===true)
                  this.setState({kingStatus: "Check."});
                else
                  this.setState({kingStatus: "Checkmate."});

                break;
              }
            }
          } 

          //code for stalemate
          let blackPieces=0, whitePieces=0; 
          for (let j=0; j<squares.length; j++){
            if (squares[j]){
              if (squares[j].player==1)
                whitePieces++;
              else
                blackPieces++;
            }
          }

          if (blackPieces==1 && whitePieces==1)
            this.setState({kingStatus: "Stalemate."});
          else if ((blackPieces==1 && this.state.player==1) || (whitePieces==1 && this.state.player==2)){
            for (let j=0; j<squares.length; j++){
              if (squares[j] && squares[j].constructor.name==="King" && squares[j].player!==this.state.player){//find the king
                let countMoves = 0;

                if (!squares[j-1] && j-1>0){
                  for (let l=0; l<squares.length; l++){
                    if (squares[l] && squares[l].player===this.state.player){
                      const isDestEnemyOccupied = squares[l]? true : false;
                      if (squares[l].isMovePossible(l, j-1, isDestEnemyOccupied) && this.isMoveLegal(squares[l].getSrcToDestPath(l, j-1))){
                        countMoves++;
                        break;
                      }
                    }
                  }
                }else
                  countMoves++;

                if (!squares[j+1] && j+1<64){
                  for (let l=0; l<squares.length; l++){
                    if (squares[l] && squares[l].player===this.state.player){
                      const isDestEnemyOccupied = squares[l]? true : false;
                      if (squares[l].isMovePossible(l, j+1, isDestEnemyOccupied) && this.isMoveLegal(squares[l].getSrcToDestPath(l, j+1))){
                        countMoves++;
                        break;
                      }
                    }
                  }
                }else
                  countMoves++;

                if (!squares[j-7] && j-7>0){
                  for (let l=0; l<squares.length; l++){
                    if (squares[l] && squares[l].player===this.state.player){
                      const isDestEnemyOccupied = squares[l]? true : false;
                      if (squares[l].isMovePossible(l, j-7, isDestEnemyOccupied) && this.isMoveLegal(squares[l].getSrcToDestPath(l, j-7))){
                        countMoves++;
                         break;
                      }
                    }
                  }
                }else
                  countMoves++;

                if (!squares[j+7] && j+7<64){
                  for (let l=0; l<squares.length; l++){
                    if (squares[l] && squares[l].player===this.state.player){
                      const isDestEnemyOccupied = squares[l]? true : false;
                      if (squares[l].isMovePossible(l, j+7, isDestEnemyOccupied) && this.isMoveLegal(squares[l].getSrcToDestPath(l, j+7))){
                        countMoves++;
                        break;
                      }
                    }
                  }
                }else
                  countMoves++;

               if (!squares[j-8] && j-8>0){
                  for (let l=0; l<squares.length; l++){
                    if (squares[l] && squares[l].player===this.state.player){
                      const isDestEnemyOccupied = squares[l]? true : false;
                      if (squares[l].isMovePossible(l, j-8, isDestEnemyOccupied) && this.isMoveLegal(squares[l].getSrcToDestPath(l, j-8))){
                        countMoves++;
                        break;
                      }
                    }
                  }
                }else
                  countMoves++;
                
                if (!squares[j+8] && j+8<64){
                  for (let l=0; l<squares.length; l++){
                    if (squares[l] && squares[l].player===this.state.player){
                      const isDestEnemyOccupied = squares[l]? true : false;
                      if (squares[l].isMovePossible(l, j+8, isDestEnemyOccupied) && this.isMoveLegal(squares[l].getSrcToDestPath(l, j+8))){
                        countMoves++;
                        break;
                      }
                    }
                  }
                }else
                  countMoves++;

                if (!squares[j-9] && j-9>0){
                  for (let l=0; l<squares.length; l++){
                    if (squares[l] && squares[l].player===this.state.player){
                      const isDestEnemyOccupied = squares[l]? true : false;
                      if (squares[l].isMovePossible(l, j-9, isDestEnemyOccupied) && this.isMoveLegal(squares[l].getSrcToDestPath(l, j-9))){
                        countMoves++;
                        break;
                      }
                    }
                  }
                }else
                  countMoves++;

                if (!squares[j+9] && j+9<64){
                  for (let l=0; l<squares.length; l++){
                    if (squares[l] && squares[l].player===this.state.player){
                      const isDestEnemyOccupied = squares[l]? true : false;
                      if (squares[l].isMovePossible(l, j+9, isDestEnemyOccupied) && this.isMoveLegal(squares[l].getSrcToDestPath(l, j+9))){
                        countMoves++;
                        break;
                      }
                    }
                  }
                }else
                  countMoves++;
                
               if (countMoves==8)
                  this.setState({kingStatus: "Stalemate."});

                break;
              }
            }
          }

          //code for pawn change
          if (this.state.player==1){
            for (let j=0; j<8; j++){
              if (squares[j] && squares[j].player==1 && squares[j].constructor.name==="Pawn"){
                this.setState({changePawn: j});
                break;
              }
            }
          }else{
            for (let j=56; j<64; j++){
              if (squares[j] && squares[j].player==2 && squares[j].constructor.name==="Pawn"){
                this.setState({changePawn: j});
                break;
              }
            }
          }
          
        }else{
          this.setState({
            status: "Wrong selection. Choose valid source and destination again.",
            sourceSelection: -1,
          });
        }
      }
    }
  }
  /**
   * Check all path indices are null. For one steps move of pawn/others or jumping moves of knight array is empty, so  move is legal.
   * @param  {[type]}  srcToDestPath [array of board indices comprising path between src and dest ]
   * @return {Boolean}               
   */ 
  isMoveLegal(srcToDestPath){
    let isLegal = true;
    for(let i = 0; i < srcToDestPath.length; i++){
      if(this.state.squares[srcToDestPath[i]] !== null){
        isLegal = false;
      }
    }
    return isLegal;
  }

  setBishop(){
    let newSquares = this.state.squares;
    if (this.state.player===1){
      newSquares[this.state.changePawn] = new Bishop(2);
      this.setState({
        squares: newSquares,
        changePawn: -1
      });
    }else{
      newSquares[this.state.changePawn] = new Bishop(1);
      this.setState({
        squares: newSquares,
        changePawn: -1
      });
    }
  }

  setQueen(){
    let newSquares = this.state.squares;
    if (this.state.player===1){
      newSquares[this.state.changePawn] = new Queen(2);
      this.setState({
        squares: newSquares,
        changePawn: -1
      });
    }else{
      newSquares[this.state.changePawn] = new Queen(1);
      this.setState({
        squares: newSquares,
        changePawn: -1
      });
    }
  }

  setKnight(){
    let newSquares = this.state.squares;
    if (this.state.player===1){
      newSquares[this.state.changePawn] = new Knight(2);
      this.setState({
        squares: newSquares,
        changePawn: -1
      });
    }else{
      newSquares[this.state.changePawn] = new Knight(1);
      this.setState({
        squares: newSquares,
        changePawn: -1
      });
    }
  }

  setRook(){
    let newSquares = this.state.squares;
    if (this.state.player===1){
      newSquares[this.state.changePawn] = new Rook(2);
      this.setState({
        squares: newSquares,
        changePawn: -1
      });
    }else{
      newSquares[this.state.changePawn] = new Rook(1);
      this.setState({
        squares: newSquares,
        changePawn: -1
      });
    }

  }

  render() {
    let showButtons=false;
    if (this.state.changePawn!==-1)
      showButtons=true;
        
    return (
      <div>
        <div className="game">
          <div className="game-board">
            <Board 
            squares = {this.state.squares}
            onClick = {(i) => this.handleClick(i)}
            />
          </div>
          <div className="game-info">
            <h3>Turn</h3>
            <div id="player-turn-box" style={{backgroundColor: this.state.turn}}>
  
            </div>
            <div className="game-status">{this.state.kingStatus}</div>
            <div className="game-status">{this.state.status}</div>

            <div className="fallen-soldier-block">
              
              {<FallenSoldierBlock
              whiteFallenSoldiers = {this.state.whiteFallenSoldiers}
              blackFallenSoldiers = {this.state.blackFallenSoldiers}
              />
            }
            </div>
            {showButtons
              ? <div> <button onClick = {this.setBishop}> Bishop </button> 
                      <button onClick = {this.setQueen}> Queen </button> 
                      <button onClick = {this.setKnight}> Knight </button> 
                      <button onClick = {this.setRook}> Rook </button> 
                </div>
              : <div> </div>
            }
          </div>
        </div>
      </div>
    );
  }
}