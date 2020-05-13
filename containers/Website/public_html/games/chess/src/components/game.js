import React from 'react';

import '../index.css';
import Board from './board.js';
import FallenSoldierBlock from './fallen-soldier-block.js';
import initialiseChessBoard from '../helpers/board-initialiser.js';
import Bishop from '../pieces/bishop.js';
import King from '../pieces/king.js';
import Knight from '../pieces/knight.js';
import Queen from '../pieces/queen.js';
import Pawn from '../pieces/pawn.js';
import Rook from '../pieces/rook.js';
import * as conn from './multiplayer.js'; 
import * as ui from './messages.js'

export default class Game extends React.Component {
  constructor(props){
    super(props);
    let args = conn.getArgumenets();
    let data = conn.connect(args['host']+':'+args['playmanster'],args['token']);
    this.state = {
      squares: initialiseChessBoard(),
      whiteFallenSoldiers: [],
      blackFallenSoldiers: [],
      player: 1,
      sourceSelection: -1,
      kingStatus: '',
      turn: 'white',
      type: null,
      myTurn: false,
      changePawn: -1,
      host: args['host'],
      gamemaster: args['gamemaster'],
      token: args['token'],
      socket: data['socket'],
      status: '',
      connectionStatus: data['connectionStatus'],
      progress: 0,
      roundID: null,
      endstate: 0,
    }
    this.setBishop = this.setBishop.bind(this);
    this.setQueen = this.setQueen.bind(this);
    this.setKnight = this.setKnight.bind(this);
    this.setRook = this.setRook.bind(this);
    conn.setListeners(this);
  }
 
  handleClick(i){
    if (this.state.myTurn){
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

        if(squares[i] && squares[i].player === this.state.player && 
          (squares[this.state.sourceSelection] instanceof King || squares[this.state.sourceSelection] instanceof Rook) &&
          (squares[i] instanceof King || squares[i] instanceof Rook)){/////////////////castling case
          
          let isPossible = true;

          if (squares[i].player === 1){//check correct position of pieces
            if (this.state.sourceSelection===60 && squares[this.state.sourceSelection] instanceof King){
              if (i!==63 && i!==56)
                isPossible=false;
            }else if (i===60 && squares[i] instanceof King){
              if (this.state.sourceSelection!==63 && this.state.sourceSelection!==56)
                isPossible=false;
            }else
              isPossible=false;
          }else{
            if (this.state.sourceSelection===4 && squares[this.state.sourceSelection] instanceof King){
              if (i!==0 && i!==7)
                isPossible=false;
            }else if (i===4 && squares[i] instanceof King){
              if (this.state.sourceSelection!==0 && this.state.sourceSelection!==7)
                isPossible=false;
            }else
              isPossible=false;
          }

          if (isPossible){//check that there are no pieces between them
            if (squares[i].player === 1){
              if (i===63 || this.state.sourceSelection===63){
                if (squares[61] || squares[62])
                  isPossible=false;
              }else{
                if (squares[57] || squares[58] || squares[59])
                  isPossible=false;
              }
            }else{
              if (i===7 || this.state.sourceSelection===7){
                if (squares[5] || squares[6])
                  isPossible=false;
              }else{
                if (squares[1] || squares[2] || squares[3])
                  isPossible=false;
              }
            }

            if (isPossible){//check if king is or passes from check
              if (squares[i].player === 1){
                if (i===63 || this.state.sourceSelection===63){
                  for (let j=0; j<squares.length; j++){
                    if (squares[j] && squares[j].player!==this.state.player){
                      const srcToDestPath1 = squares[j].getSrcToDestPath(j, 60);
                      const srcToDestPath2 = squares[j].getSrcToDestPath(j, 61);
                      const srcToDestPath3 = squares[j].getSrcToDestPath(j, 62);
                      if ((squares[j].isMovePossible(j, 60, false) && this.isMoveLegal(srcToDestPath1, squares)) ||
                          (squares[j].isMovePossible(j, 61, false) && this.isMoveLegal(srcToDestPath2, squares)) ||
                          (squares[j].isMovePossible(j, 62, false) && this.isMoveLegal(srcToDestPath3, squares))){
                        isPossible=false;
                        break;
                      }
                    }
                  }
                }else{
                  for (let j=0; j<squares.length; j++){
                    if (squares[j] && squares[j].player!==this.state.player){
                      const srcToDestPath1 = squares[j].getSrcToDestPath(j, 60);
                      const srcToDestPath2 = squares[j].getSrcToDestPath(j, 59);
                      const srcToDestPath3 = squares[j].getSrcToDestPath(j, 58);
                      if ((squares[j].isMovePossible(j, 60, false) && this.isMoveLegal(srcToDestPath1, squares)) ||
                          (squares[j].isMovePossible(j, 59, false) && this.isMoveLegal(srcToDestPath2, squares)) ||
                          (squares[j].isMovePossible(j, 58, false) && this.isMoveLegal(srcToDestPath3, squares))){
                        isPossible=false;
                        break;
                      }
                    }
                  }
                }
              }else{
                if (i===7 || this.state.sourceSelection===7){
                  for (let j=0; j<squares.length; j++){
                    if (squares[j] && squares[j].player!==this.state.player){
                      const srcToDestPath1 = squares[j].getSrcToDestPath(j, 4);
                      const srcToDestPath2 = squares[j].getSrcToDestPath(j, 5);
                      const srcToDestPath3 = squares[j].getSrcToDestPath(j, 6);
                      if ((squares[j].isMovePossible(j, 4, false) && this.isMoveLegal(srcToDestPath1, squares)) ||
                          (squares[j].isMovePossible(j, 5, false) && this.isMoveLegal(srcToDestPath2, squares)) ||
                          (squares[j].isMovePossible(j, 6, false) && this.isMoveLegal(srcToDestPath3, squares))){
                        isPossible=false;
                        break;
                      }
                    }
                  }
                }else{
                  for (let j=0; j<squares.length; j++){
                    if (squares[j] && squares[j].player!==this.state.player){
                      const srcToDestPath1 = squares[j].getSrcToDestPath(j, 4);
                      const srcToDestPath2 = squares[j].getSrcToDestPath(j, 3);
                      const srcToDestPath3 = squares[j].getSrcToDestPath(j, 2);
                      if ((squares[j].isMovePossible(j, 4, false) && this.isMoveLegal(srcToDestPath1, squares)) ||
                          (squares[j].isMovePossible(j, 3, false) && this.isMoveLegal(srcToDestPath2, squares)) ||
                          (squares[j].isMovePossible(j, 2, false) && this.isMoveLegal(srcToDestPath3, squares))){
                        isPossible=false;
                        break;
                      }
                    }
                  }
                }
              }
            }
          }

          if (isPossible){
            if (squares[i].player === 1){
              if (i===63 || this.state.sourceSelection===63){
                squares[62]=squares[60];
                squares[61]=squares[63];
                squares[63]=null;
              }else{
                squares[58]=squares[60];
                squares[59]=squares[56];
                squares[56]=null;
              }
              squares[60]=null;
            }else{
              if (i===7 || this.state.sourceSelection===7){
                squares[6]=squares[4];
                squares[5]=squares[7];
                squares[7]=null;
              }else{
                squares[2]=squares[4];
                squares[3]=squares[0];
                squares[0]=null;
              }
              squares[4]=null;
            }

            let player = this.state.player === 1? 2: 1;
            let turn = this.state.turn === 'white'? 'black' : 'white';
            this.setState({
              squares: squares,
              player: player,
              turn: turn,
              type: turn,
              kingStatus: '',
              myTurn: !this.state.myTurn,
              changePawn: -1,
              status: "Castling occured.",
              sourceSelection: -1,
            });
            var textSquares = this.classesToStrings(squares);
            var textWhiteFallenSoldiers = this.classesToStrings(this.state.whiteFallenSoldiers);
            var textBlackFallenSoldiers = this.classesToStrings(this.state.blackFallenSoldiers);
            let message = {
              roundID : this.state.roundID,
              board : textSquares,
              whiteFallenSoldiers: textWhiteFallenSoldiers,
              blackFallenSoldiers: textBlackFallenSoldiers,
              progress : 0
            }
            this.state.socket.emit('update', message);
          }else{
            this.setState({
              status: "Wrong selection. Castling not allowed.",
              sourceSelection: -1,
            });
          }

        }else if(squares[i] && squares[i].player === this.state.player){
          this.setState({
            status: "Wrong selection. Choose valid source and destination again.",
            sourceSelection: -1,
          });
        }else{
          const whiteFallenSoldiers = this.state.whiteFallenSoldiers.slice();
          const blackFallenSoldiers = this.state.blackFallenSoldiers.slice();
          const isDestEnemyOccupied = squares[i]? true : false; 
          const isMovePossible = squares[this.state.sourceSelection].isMovePossible(this.state.sourceSelection, i, isDestEnemyOccupied);
          const srcToDestPath = squares[this.state.sourceSelection].getSrcToDestPath(this.state.sourceSelection, i);
          const isMoveLegal = this.isMoveLegal(srcToDestPath, squares);

          if(isMovePossible && isMoveLegal){
            let whitePushed=false, blackPushed=false;
            if(squares[i] !== null){
              if(squares[i].player === 1){
                whiteFallenSoldiers.push(squares[i]);     
                whitePushed=true;         
              }else{
                blackFallenSoldiers.push(squares[i]);
                blackPushed=true;
              }
            }

            let check=false;
            if (this.state.kingStatus==="Check.")
              check=true;

            var kingStatus = 0;
            var itisCheck = false;
            const saveSquare = squares[i];
            squares[i] = squares[this.state.sourceSelection];
            squares[this.state.sourceSelection] = null;
            let player = this.state.player === 1? 2: 1;
            let turn = this.state.turn === 'white'? 'black' : 'white';
            this.setState({
              sourceSelection: -1,
              squares: squares,
              whiteFallenSoldiers: whiteFallenSoldiers,
              blackFallenSoldiers: blackFallenSoldiers,
              myTurn: !this.state.myTurn,
              player: player,
              status: '',
              kingStatus: '',
              turn: turn,
              type: turn,
              changePawn: -1
            });

            let moveOn=true;
            if (check){
              for (let j=0; j<squares.length; j++){
                if (squares[j] && squares[j] instanceof King && squares[j].player===this.state.player){//find the king
                  for (let k=0; k<squares.length; k++){
                    if (squares[k] && squares[k].player!==this.state.player){
                      const checkSrcToDestPath = squares[k].getSrcToDestPath(k, j);
                      if (squares[k].isMovePossible(k, j, isDestEnemyOccupied) && this.isMoveLegal(checkSrcToDestPath, squares)){//find if enemy threatens the king
                        squares[this.state.sourceSelection] = squares[i];
                        squares[i]=saveSquare;
                        player = this.state.player === 1? 1: 2;
                        turn = this.state.turn === 'white'? 'white' : 'black';
                        if (whitePushed)
                          whiteFallenSoldiers.pop();
                        else if(blackPushed)
                          blackFallenSoldiers.pop();
                        this.setState({
                          squares: squares,
                          whiteFallenSoldiers: whiteFallenSoldiers,
                          blackFallenSoldiers: blackFallenSoldiers,
                          player: player,
                          myTurn: this.state.myTurn,
                          kingStatus: "Check.",
                          status: 'Wrong selection. You need to avoid check.',
                          turn: turn,
                          type: turn
                        });
                        kingStatus=-1;
                        moveOn=false;
                        break;
                      }
                    }
                  }
                  break;
                }
              }
            }else{
              for (let j=0; j<squares.length; j++){
                if (squares[j] && squares[j] instanceof King && squares[j].player===this.state.player){//find the king
                  for (let k=0; k<squares.length; k++){
                    if (squares[k] && squares[k].player!==this.state.player){
                      const checkSrcToDestPath = squares[k].getSrcToDestPath(k, j);
                      if (squares[k].isMovePossible(k, j, isDestEnemyOccupied) && this.isMoveLegal(checkSrcToDestPath, squares)){//find if enemy threatens the king
                        squares[this.state.sourceSelection] = squares[i];
                        squares[i]=saveSquare;
                        player = this.state.player === 1? 1: 2;
                        turn = this.state.turn === 'white'? 'white' : 'black';
                        if (whitePushed)
                          whiteFallenSoldiers.pop();
                        else if(blackPushed)
                          blackFallenSoldiers.pop();
                        this.setState({
                          squares: squares,
                          whiteFallenSoldiers: whiteFallenSoldiers,
                          blackFallenSoldiers: blackFallenSoldiers,
                          myTurn: this.state.myTurn,
                          player: player,
                          kingStatus: '',
                          status: 'Wrong selection. You cannot go to check.',
                          turn: turn,
                          type: turn
                        });
                        kingStatus=-1;
                        moveOn=false;
                        break;
                      }
                    }
                  }
                  break;
                }
              }
            }

            if (moveOn){
              //code for check and checkmate
              for (let j=0; j<squares.length; j++){
                if (squares[j] && squares[j] instanceof King && squares[j].player!==this.state.player){//find the king
                  for (let k=0; k<squares.length; k++){
                    if (squares[k] && squares[k].player===this.state.player){
                      const srcToDestPath = squares[k].getSrcToDestPath(k, j);
                      if (squares[k].isMovePossible(k, j, isDestEnemyOccupied) && this.isMoveLegal(srcToDestPath, squares)){//find if enemy threatens the king

                        for (let l=0; l<squares.length; l++){
                          if (squares[l] && squares[l].player!==this.state.player){
                            for (let m=0; m<srcToDestPath.length; m++){
                              if (squares[l].isMovePossible(l, srcToDestPath[m], isDestEnemyOccupied) && this.isMoveLegal(squares[l].getSrcToDestPath(l, srcToDestPath[m]), squares) 
                                && !(squares[l] instanceof King)){
                                itisCheck=true;
                                break;
                              }
                            }
                          }
                        }

                        if (itisCheck===true){//find king's possible moves and check if they avoid checkmate
                          let countMoves = 0;

                          if ((!squares[j-1] || j-1===k) && j-1>=0){
                            for (let l=0; l<squares.length; l++){
                              if (squares[l] && squares[l].player===this.state.player && l!==k){
                                const isDestEnemyOccupied = squares[l]? true : false; 
                                if (squares[l].isMovePossible(l, j-1, isDestEnemyOccupied) && this.isMoveLegal(squares[l].getSrcToDestPath(l, j-1), squares)){
                                  countMoves++;
                                  break;
                                }
                              }
                            }
                          }else
                            countMoves++;
            
                          if ((!squares[j+1] || (j+1)===k) && j+1<64){
                            for (let l=0; l<squares.length; l++){
                              if (squares[l] && squares[l].player===this.state.player && l!==k){
                                const isDestEnemyOccupied = squares[l]? true : false;
                                  if (squares[l].isMovePossible(l, j+1, isDestEnemyOccupied) && this.isMoveLegal(squares[l].getSrcToDestPath(l, j+1), squares)){
                                    countMoves++;
                                    break;
                                  }
                                }
                              }
                            }else
                              countMoves++;

                          if ((!squares[j-7] || (j-7)===k) && j-7>=0){
                            for (let l=0; l<squares.length; l++){
                              if (squares[l] && squares[l].player===this.state.player && l!==k){
                                const isDestEnemyOccupied = squares[l]? true : false;
                                if (squares[l].isMovePossible(l, j-7, isDestEnemyOccupied) && this.isMoveLegal(squares[l].getSrcToDestPath(l, j-7), squares)){
                                  countMoves++;
                                  break;
                                }
                              }
                            }
                          }else
                            countMoves++;

                          if ((!squares[j+7] || (j+7)===k) && j+7<64){
                            for (let l=0; l<squares.length; l++){
                              if (squares[l] && squares[l].player===this.state.player && l!==k){
                                const isDestEnemyOccupied = squares[l]? true : false;
                                if (squares[l].isMovePossible(l, j+7, isDestEnemyOccupied) && this.isMoveLegal(squares[l].getSrcToDestPath(l, j+7), squares)){
                                  countMoves++;
                                  break;
                                }
                              }
                            }
                          }else
                            countMoves++;

                          if ((!squares[j-8] || (j-8)===k) && j-8>=0){
                            for (let l=0; l<squares.length; l++){
                              if (squares[l] && squares[l].player===this.state.player && l!==k){
                                const isDestEnemyOccupied = squares[l]? true : false;
                                if (squares[l].isMovePossible(l, j-8, isDestEnemyOccupied) && this.isMoveLegal(squares[l].getSrcToDestPath(l, j-8), squares)){
                                  countMoves++;
                                  break;
                                }
                              }
                            }
                          }else
                            countMoves++;

                          if ((!squares[j+8] || (j+8)===k) && j+8<64){
                            for (let l=0; l<squares.length; l++){
                              if (squares[l] && squares[l].player===this.state.player && l!==k){
                                const isDestEnemyOccupied = squares[l]? true : false;
                                if (squares[l].isMovePossible(l, j+8, isDestEnemyOccupied) && this.isMoveLegal(squares[l].getSrcToDestPath(l, j+8), squares)){
                                  countMoves++;
                                  break;
                                }
                              }
                            }
                          }else
                            countMoves++;

                          if ((!squares[j-9] || (j-9)===k) && j-9>=0){
                            for (let l=0; l<squares.length; l++){
                              if (squares[l] && squares[l].player===this.state.player && l!==k){
                                const isDestEnemyOccupied = squares[l]? true : false;
                                if (squares[l].isMovePossible(l, j-9, isDestEnemyOccupied) && this.isMoveLegal(squares[l].getSrcToDestPath(l, j-9), squares)){
                                  countMoves++;
                                  break;
                                }
                              }
                            }
                          }else
                            countMoves++;

                          if ((!squares[j+9] || (j+9)===k) && j+9<64){
                            for (let l=0; l<squares.length; l++){
                              if (squares[l] && squares[l].player===this.state.player && l!==k){
                                const isDestEnemyOccupied = squares[l]? true : false;
                                if (squares[l].isMovePossible(l, j+9, isDestEnemyOccupied) && this.isMoveLegal(squares[l].getSrcToDestPath(l, j+9), squares)){
                                  countMoves++;
                                  break;
                                }
                              }
                            }
                          }else
                            countMoves++;

                          if (countMoves===8)
                            itisCheck=false;
                        }
                                              
                        if (itisCheck===true){
                          this.setState({kingStatus: "Check."});
                          kingStatus=1;
                        }else{
                          this.setState({kingStatus: "Checkmate."});
                          kingStatus=2;
                        }

                        break;
                      }
                    }
                  }
                  break;
                }
              } 

              //code for stalemate
              let blackPieces=0, whitePieces=0; 
              for (let j=0; j<squares.length; j++){
                if (squares[j]){
                  if (squares[j].player===1)
                    whitePieces++;
                  else
                    blackPieces++;
                }
              }

              if (blackPieces===1 && whitePieces===1){
                this.setState({kingStatus: "Stalemate."});
                kingStatus=3;
              }else if ((blackPieces===1 && this.state.player===1) || (whitePieces===1 && this.state.player===2)){
                for (let j=0; j<squares.length; j++){
                  if (squares[j] && squares[j] instanceof King && squares[j].player!==this.state.player){//find the king
                    let countMoves = 0;

                    if (!squares[j-1] && j-1>0){
                      for (let l=0; l<squares.length; l++){
                        if (squares[l] && squares[l].player===this.state.player){
                          const isDestEnemyOccupied = squares[l]? true : false;
                          if (squares[l].isMovePossible(l, j-1, isDestEnemyOccupied) && this.isMoveLegal(squares[l].getSrcToDestPath(l, j-1), squares)){
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
                          if (squares[l].isMovePossible(l, j+1, isDestEnemyOccupied) && this.isMoveLegal(squares[l].getSrcToDestPath(l, j+1), squares)){
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
                          if (squares[l].isMovePossible(l, j-7, isDestEnemyOccupied) && this.isMoveLegal(squares[l].getSrcToDestPath(l, j-7), squares)){
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
                          if (squares[l].isMovePossible(l, j+7, isDestEnemyOccupied) && this.isMoveLegal(squares[l].getSrcToDestPath(l, j+7), squares)){
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
                          if (squares[l].isMovePossible(l, j-8, isDestEnemyOccupied) && this.isMoveLegal(squares[l].getSrcToDestPath(l, j-8), squares)){
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
                          if (squares[l].isMovePossible(l, j+8, isDestEnemyOccupied) && this.isMoveLegal(squares[l].getSrcToDestPath(l, j+8), squares)){
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
                          if (squares[l].isMovePossible(l, j-9, isDestEnemyOccupied) && this.isMoveLegal(squares[l].getSrcToDestPath(l, j-9), squares)){
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
                          if (squares[l].isMovePossible(l, j+9, isDestEnemyOccupied) && this.isMoveLegal(squares[l].getSrcToDestPath(l, j+9), squares)){
                            countMoves++;
                            break;
                          }
                        }
                      }
                    }else
                      countMoves++;
                    
                   if (countMoves===8){
                      this.setState({kingStatus: "Stalemate."});
                      kingStatus=3;
                   }

                    break;
                  }
                }
              }

              //code for pawn change
              if (this.state.player===1){
                for (let j=0; j<8; j++){
                  if (squares[j] && squares[j].player===1 && squares[j] instanceof Pawn){
                    this.setState({changePawn: j});
                    break;
                  }
                }
              }else{
                for (let j=56; j<64; j++){
                  if (squares[j] && squares[j].player===2 && squares[j] instanceof Pawn){
                    this.setState({changePawn: j});
                    break;
                  }
                }
              }
            }
            if (kingStatus!==-1){


              textSquares = this.classesToStrings(squares);
              textWhiteFallenSoldiers = this.classesToStrings(whiteFallenSoldiers);
              textBlackFallenSoldiers = this.classesToStrings(blackFallenSoldiers);
              var message = {
                roundID : this.state.roundID,
                board : textSquares,
                whiteFallenSoldiers: textWhiteFallenSoldiers,
                blackFallenSoldiers: textBlackFallenSoldiers,
                kingStatus: '',
                progress : 0
              }

              if (kingStatus===2){
                message = {
                  roundID : this.state.roundID,
                  board : textSquares,
                  kingStatus: 'Checkmate.',
                  whiteFallenSoldiers: textWhiteFallenSoldiers,
                  blackFallenSoldiers: textBlackFallenSoldiers,
                  progress : 1
                }
              }else if(kingStatus===3){
                message = {
                  roundID : this.state.roundID,
                  board : textSquares,
                  kingStatus: 'Stalemate.',
                  whiteFallenSoldiers: textWhiteFallenSoldiers,
                  blackFallenSoldiers: textBlackFallenSoldiers,
                  progress : 2
                }
              }else if(kingStatus===1){
                message = {
                  roundID : this.state.roundID,
                  board : textSquares,
                  whiteFallenSoldiers: textWhiteFallenSoldiers,
                  blackFallenSoldiers: textBlackFallenSoldiers,
                  kingStatus: 'Check.',
                  progress : 0
                }
              }
                        
              this.state.socket.emit('update', message);
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
  }
  /**
   * Check all path indices are null. For one steps move of pawn/others or jumping moves of knight array is empty, so  move is legal.
   * @param  {[type]}  srcToDestPath [array of board indices comprising path between src and dest ]
   * @return {Boolean}               
   */ 
  isMoveLegal(srcToDestPath, squares){
    let isLegal = true;
    for(let i = 0; i < srcToDestPath.length; i++){
      if(squares[srcToDestPath[i]] !== null){
        isLegal = false;
      }
    }
    return isLegal;
  }

  classesToStrings(squares){
    console.log("squares")
    console.log(squares)
   var textSquares = [];
    for (let i=0; i<squares.length; i++){
      if (squares[i]){
          if (squares[i] instanceof King){
            if (squares[i].player===1)
              textSquares.push("King 1");
            else
              textSquares.push("King 2");
          }else if (squares[i] instanceof Pawn){
            if (squares[i].player===1)
              textSquares.push("Pawn 1");
            else
              textSquares.push("Pawn 2");
          }else if (squares[i] instanceof Queen){
            if (squares[i].player===1)
              textSquares.push("Queen 1");
            else
              textSquares.push("Queen 2");
          }else if (squares[i] instanceof Bishop){
            if (squares[i].player===1)
              textSquares.push("Bishop 1");
            else
              textSquares.push("Bishop 2");
          }else if (squares[i] instanceof Knight){
            if (squares[i].player===1)
              textSquares.push("Knight 1");
            else
              textSquares.push("Knight 2");
          }else if (squares[i] instanceof Rook){
            if (squares[i].player===1)
              textSquares.push("Rook 1");
            else
              textSquares.push("Rook 2");
          }
      }else{
        textSquares.push(0);
      }
    }
    console.log("textSquares");
    console.log(textSquares);
    return textSquares;
  }

  // classesToStrings(squares){
  //   console.log("squares")
  //   console.log(squares)
  //  var textSquares = [];
  //   for (let i=0; i<squares.length; i++){
  //     if (squares[i]){
  //       console.log(squares[i] instanceof Bishop)
  //       console.log(i)
  //       switch(squares[i].constructor.name){
  //         case "King":
  //           if (squares[i].player===1)
  //             textSquares.push("King 1");
  //           else
  //             textSquares.push("King 2");
  //           break;
  //         case "Pawn":
  //           if (squares[i].player===1)
  //             textSquares.push("Pawn 1");
  //           else
  //             textSquares.push("Pawn 2");
  //           break;
  //         case "Queen":
  //           if (squares[i].player===1)
  //             textSquares.push("Queen 1");
  //           else
  //             textSquares.push("Queen 2");
  //           break;
  //         case "Bishop":
  //           if (squares[i].player===1)
  //             textSquares.push("Bishop 1");
  //           else
  //             textSquares.push("Bishop 2");
  //           break;
  //         case "Knight":
  //           if (squares[i].player===1)
  //             textSquares.push("Knight 1");
  //           else
  //             textSquares.push("Knight 2");
  //           break;
  //         case "Rook":
  //           if (squares[i].player===1)
  //             textSquares.push("Rook 1");
  //           else
  //             textSquares.push("Rook 2");
  //           break;
  //         default:
  //           break;
  //       }
  //     }else{
  //       textSquares.push(0);
  //     }
  //   }
  //   console.log("textSquares");
  //   console.log(textSquares);
  //   return textSquares;
  // }

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
    var textSquares = this.classesToStrings(this.state.squares);
    var message = {
      roundID : this.state.roundID,
      board: textSquares,
      dontChange: true
    }
    this.state.socket.emit('update', message);
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
    var textSquares = this.classesToStrings(this.state.squares);
    var message = {
      roundID : this.state.roundID,
      board: textSquares,
      dontChange: true
    }
    this.state.socket.emit('update', message);
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
    var textSquares = this.classesToStrings(this.state.squares);
    var message = {
      roundID : this.state.roundID,
      board: textSquares,
      dontChange: true
    }
    this.state.socket.emit('update', message);
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
    var textSquares = this.classesToStrings(this.state.squares);
    var message = {
      roundID : this.state.roundID,
      board: textSquares,
      dontChange: true
    }
    this.state.socket.emit('update', message);
  }

  render() {
    let showButtons=false;
    if (this.state.changePawn!==-1)
      showButtons=true;
    
    let status = ui.showGameStatus(this.state.connectionStatus);
    let endState = ui.showWinner(this.state.endstate, this.state.connectionStatus);

    if (this.state.connectionStatus !== 5) {
        var turn = ui.showTurn(this.state.connectionStatus, this.state.myTurn);
        var symbol ='Your color: <div id="player-turn-box" style="background-color:'+this.state.myColor+'"></div>'
    }
        
    return (
      <div className="game"> 
          <div className="game-title">
            <div>Chess</div>
          </div>

          <div className="game-board">
            <Board 
              squares = {this.state.squares}
              onClick = {(i) => this.handleClick(i)}
            />
          </div>

          <div className="game-info">
            <div>{status}</div>
            <td dangerouslySetInnerHTML={{__html: symbol}} />
            <div>{turn}</div>
           
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
          <div id="endstate">{endState}</div>

      </div>
    );
  }
}