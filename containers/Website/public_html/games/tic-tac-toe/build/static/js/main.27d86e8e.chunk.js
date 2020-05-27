(this["webpackJsonptic-tac-toe"]=this["webpackJsonptic-tac-toe"]||[]).push([[0],{17:function(t,e,a){},36:function(t,e,a){t.exports=a(74)},71:function(t,e){},74:function(t,e,a){"use strict";a.r(e);var s=a(0),n=a.n(s),r=a(33),o=a.n(r),u=(a(17),a(5)),c=a(12),i=a(13),l=a(15),d=a(14),m=a(35);function h(t){for(var e=[[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]],a=0;a<e.length;a++){var s=Object(m.a)(e[a],3),n=s[0],r=s[1],o=s[2];if(t[n]&&t[n]===t[r]&&t[n]===t[o])return f(e[a]),t[n]}return null}function f(t){var e;for(e in t)document.getElementsByClassName("square")[t[e]].style.textShadow="red 0px 0px 10px"}function v(t){for(var e=0;e<t.length;e++)if(null==t[e])return!1;return!0}var k=a(34),p=a.n(k);function g(t,e){var a={query:"token="+e},s=p()(t,a);return{socket:s,status:s.connected?0:-1}}function b(t){t.state.socket.on("wait",(function(e){t.setState({status:1,roundID:e.roundID})})),t.state.socket.on("init",(function(e){if(null===t.state.type){var a=e.turn,s=a?"X":"O";t.setState({status:2,type:s,myTurn:a,roundID:e.roundID})}else t.setState({status:2,roundID:e.roundID})})),t.state.socket.on("viewer",(function(e){console.log("VIWER"),t.setState({status:5,squares:e})})),t.state.socket.on("board",(function(e){var a=e.board;e.progress;t.setState({squares:a,myTurn:!0});var s=h(a),n=v(a);(s||n)&&t.setState({status:3})})),t.state.socket.on("disconnect",(function(e){if(!(t.state.status<0||t.state.status>2)||5===t.state.connectionStatus){t.state.socket.disconnect(),t.setState({status:-2});var a=new XMLHttpRequest;a.onload=function(e){if(4===a.readyState)if(200===a.status){var s=JSON.parse(a.responseText);console.log(s.playmaster),function(t,e){console.log("reconnecting...");var a=t.state.host+":"+e,s=t.state.token,n=g(a,s);t.setState({socket:n.socket,status:n.status}),console.log(n.socket),b(t)}(t,s.playmaster)}else 403===a.status&&t.setState({status:-3})};var s,n,r,o="http://"+(t.state.host+":"+t.state.gamemaster+"/client")+"?token="+t.state.token+"&game=tic-tac-toe&roundID="+t.state.roundID;s=100*(n=1,r=300,Math.floor(Math.random()*(r-n+1))+n),setTimeout((function(){a.open("GET",o),a.setRequestHeader("Access-Control-Allow-Origin","*"),a.send()}),s)}})),t.state.socket.on("endgame",(function(e){t.setState({status:4}),t.state.socket.disconnect()}))}function y(t){return n.a.createElement("button",{className:"square",onClick:t.onClick},t.value)}var E=function(t){Object(l.a)(a,t);var e=Object(d.a)(a);function a(){return Object(c.a)(this,a),e.apply(this,arguments)}return Object(i.a)(a,[{key:"renderSquare",value:function(t){var e=this;return n.a.createElement(y,{value:this.props.squares[t],onClick:function(){return e.props.onClick(t)}})}},{key:"render",value:function(){return n.a.createElement("div",null,n.a.createElement("div",{className:"board-row"},this.renderSquare(0),this.renderSquare(1),this.renderSquare(2)),n.a.createElement("div",{className:"board-row"},this.renderSquare(3),this.renderSquare(4),this.renderSquare(5)),n.a.createElement("div",{className:"board-row"},this.renderSquare(6),this.renderSquare(7),this.renderSquare(8)))}}]),a}(n.a.Component),S=function(t){Object(l.a)(a,t);var e=Object(d.a)(a);function a(t){var s;Object(c.a)(this,a),s=e.call(this,t);var n=function(){var t=window.location.href,e=new URL(t),a=e.hostname,s=e.searchParams.get("pm"),n=e.searchParams.get("gm");return{host:a,token:e.searchParams.get("token"),playmanster:s,gamemaster:n}}(),r=g(n.host+":"+n.playmanster,n.token);return s.state={host:n.host,gamemaster:n.gamemaster,squares:Array(9).fill(null),myTurn:!1,token:n.token,socket:r.socket,status:r.status,type:null,roundID:null},b(Object(u.a)(s)),s}return Object(i.a)(a,[{key:"handleClick",value:function(t){if(this.state.myTurn&&5!==this.state.state){var e=this.state.squares.slice();if(h(e)||e[t])return;e[t]=this.state.type,this.setState({squares:e,myTurn:!this.state.myTurn});var a=h(e),s=v(e),n=0;a===this.state.type?n=1:null===a&&s&&(n=2),(s||a)&&this.setState({status:3});var r={roundID:this.state.roundID,board:e,progress:n};console.log(r),this.state.socket.emit("update",r)}}},{key:"render",value:function(){var t=this,e=h(this.state.squares),a=v(this.state.squares),s=function(t){var e;switch(t){case-3:e="Unauthorized connection.";break;case-2:e="Redirecting...";break;case-1:e="No connection found.";break;case 0:e="Connected!";break;case 1:e="Wait for opponent to connect.";break;case 2:e="The game is active.";break;case 3:e="The game is completed!";break;case 4:e="The opponent left.";break;case 5:e="Spectator mode.";break;default:e="Undefined status."}return e}(this.state.status),r=function(t,e,a,s){var n;return 5!==s?null!==e&&t===e||4===s?n="VICTORY!":null!=t&&t!==e?n="DEFEAT!":null==t&&!0===a&&(n="TIE!"):null!==t?n="WINNER: "+t:a&&(n="TIE!"),n}(e,this.state.type,a,this.state.status);if(5!==this.state.status)var o=function(t,e){var a;return 2===t&&(a=e?"Your turn.":"Opponent's turn."),a}(this.state.status,this.state.myTurn),u=function(t){var e;return t&&(e="You are: "+t),e}(this.state.type);return n.a.createElement("div",{className:"game"},n.a.createElement("div",{className:"game-title"},n.a.createElement("div",null,"Tic - Tac - Toe")),n.a.createElement("div",{className:"game-board"},n.a.createElement(E,{squares:this.state.squares,onClick:function(e){return t.handleClick(e)}})),n.a.createElement("div",{className:"game-info row"},n.a.createElement("div",{className:"status column left"},n.a.createElement("div",null,u),n.a.createElement("div",null,s),n.a.createElement("div",null,o)),n.a.createElement("div",{className:"column right"},n.a.createElement("div",{id:"endstate"},r))))}}]),a}(n.a.Component);o.a.render(n.a.createElement(S,null),document.getElementById("root"))}},[[36,1,2]]]);
//# sourceMappingURL=main.27d86e8e.chunk.js.map