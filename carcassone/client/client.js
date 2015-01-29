/****
Subscripcion de las listas o bases de datos creadas en el servidor
****/

    Meteor.subscribe("all_games"); 
    Meteor.subscribe("users_data"); 
    Meteor.subscribe("userNames");

    Tracker.autorun(function(){
        var current_game = Session.get("current_game");
		Meteor.subscribe("users_score", current_game);
	    Meteor.subscribe("users_score_cc", current_game);
        Meteor.subscribe("messages_current_game", current_game); // Mensajes del chat del juego
        Meteor.subscribe("matches_game", current_game); // Marcador de las partidas
    });
    

    Meteor.startup(function(){
        Session.set("current_game", "none");
		
    	Meteor.subscribe("turnoIU");
		console.log("Arrancado Cliente");
		    
		 //CONTAINER = ALIEN INVASION
		 //TABLERO = CARCASONE
		$('#scoreFW').hide();
	    $('#scoreCC').hide();
        $('#gamecontainer').hide();
        $('#container').hide();
        $('#waiting_matches').hide();
        $('#player_joined').hide();
        $('#game_features').hide();
        $('#display_match_started').hide();
        $('#tablero').hide();
		Busy_tablero = false
		$('#points').hide();
		console.log("HIDE A TODO");
        $(document).on("click", ".alert .close", function(e) {
        	$(this).parent().hide();       
        });      
        
    });

    var Busy = {OnlyBusy:false,Busy_playing:false,Busy_joined:false,Busy_tablero:false};
    var match_name;   
    

    var currentUser = null;
		Tracker.autorun(function(){
		console.log("current user: " + currentUser);
		currentUser = Meteor.userId();
		console.log("current user: " + currentUser);
	});




    Template.options.events({                 
        'click #start_game': function () {
            match_name=$('#nombre').val();
		    var score= 0;
		    var status= 'Waiting';
		    var usuid = Meteor.userId();
		    var usu = Meteor.users.findOne(usuid);

            match_object_insert = Matches_games.findOne({match_name:match_name});
		    match_created = Matches_games.findOne({match_name:match_name});
			 //Introducimos el usuario
			var jugador= Object.create(Object.prototype);

            players=[];
			jugador.nombreJugador= usu.username;
			jugador.idJugador= usuid;
			jugador.puntuacion= score;
			players.push(jugador);

		    if (match_created != undefined){ 
		        alert("The name of the match is already used, please, try other.");
		    }else{
			    n_players= parseInt($('input[name=n_players]:checked', '#game_features').val());   
		        $('#game_features').hide();
				
		        Matches_games.insert({
				    id_user: usuid,
		            match_name: match_name,
		            num_players: n_players,
		            owner: usu.username,
		                    //score: score,
		            status: status,
					players_array: players,                   
		        });

			    Busy.OnlyBusy = true;
				$('#display_matches').hide();
                $('#waiting_for_players').show();
		                //Meteor.call('add_player',match_name);
             }
        },

        'click #close_options': function () {
            $('#game_features').hide();
            $('#display_matches').show();

            var game = Games.findOne({g_name:"Carcason"});
            Session.set("current_game", game._id);

        },

	    'click #wait_cancel': function () {
            $('#waiting_for_players').hide();
            $('#display_matches').hide();

		    match_id = Matches_games.findOne({match_name:match_name});

		    Matches_games.remove(match_id._id)
            alert("Your match was canceled succesfully.");
		    Busy.OnlyBusy = false;
        },

        'click #wait_start': function () {
                $('#waiting_for_players').hide();
		        match_object2 = Matches_games.findOne({match_name:match_name});
                alert("Su partida ha comenzado.");
		        Busy.Busy_Playing = true;
		        Busy.OnlyBusy = false;
		        Matches_games.update(match_object2._id,{$set: {status: "Started"}});
		        $('#display_match_started').show();
                Admin= Meteor.users.findOne(Meteor.userId()).username;
                info_partida = Matches_games.findOne({owner: Admin});
				//Creamos el objeto partida que le vamos a pasar a IA/IU
				var partida = Object.create(Object.prototype);
				partida.idPartida= info_partida._id;
				partida.nombrePartida= info_partida.match_name;
				partida.numJugadores= info_partida.num_players;				
				partida.arrayJugadores= info_partida.players_array;
                //Aqui le pasamos el objeto partida a IA
				$('#waiting_matches').hide();
				$('#tablero').show();
				Busy_tablero = true
			    console.log("////////////////////////////yiiiiiiiiiiiiiiiiaaAAAAAAAA");
				console.log(partida);
				Meteor.call("generarPartidaPL",partida, function(error){
                    if(error){
                        alert("No ha sido posible crear la partida");
                    }
                });
		}
    });
                 

    Template.join_match.events({        
        'click button': function (){
            var array_players = [];
            $("#join_match").click(function() {
                            matches_game.insert({
                                 array_player_names: array_players.push({name_player:Meteor.userId()})         
                            });               
            })               
        }
    });


    // Para unirse a un juego (carcassone, alliensInvasion...)
    // Template.join_game.events({
       
    //     'click button': function (){
    //         $("#join_game").click(function() {
    //                     games.insert({
    //                             id_game:id_game,   // obtener el valor de id_game   
    //                             game_type:game_type // obtener el game_type
    //                     });   
    //     			})
    // 			}      
    // });

   /* Template.puntuaciones.scores = function (){
		users_score.insert({player_name:"Valerian",score:1000});       
        var arrayPuntuaciones =  users_score.find({}, { sort: { puntuacion: -1 }});
        puntuations =[];
		//puntuations= arrayPuntuaciones;
		
		arrayPuntuaciones.forEach(function(m){
            puntuations.push({name: m.player_name , points: m.score});
        });	
		conole.log("PPPPPPPPPPPPPPPPP" + puntuations)  ;      
		return puntuations;    
    }*/
	/*
	PARTIDA = {	idPartida : 
				arrayJugadores: [{nombreJugador: kevin, puntuacion: 2},{}]
				
	
	
	*/


	partidaTerminada = function partidaTerminada(partida){
        $('#tablero').hide();
        alert("Match finished");
        OnlyBusy = false;
        Busy_playing = false;
        Busy_joined = false;
        Busy_tablero = false;
        for(i= 0; i< partida.arrayJugadores.length; i++ ){
            Users_score_cc.insert({user:partida.arrayJugadores[i].nombreJugador, score: partida.arrayJugadores[i].puntuacion, });
        }
        Matches_games.remove(partida.idPartida);
    }

    Template.menu_bar.events = {
        'click #AI_button': function () {
            if(!Busy.OnlyBusy){
            	$('#scoreFW').show();
	        	$('#scoreCC').hide();
				$('#tablero').hide();
				Busy_tablero = false;
                //$('#container').show();
                $('#gamecontainer').hide();
                $('#waiting_matches').hide();
				$('#points').show();    
				console.log("SHOW CONTAINER: ALIEN INVASION");            
				var game = Games.findOne({g_name:"AlienInvasion"});
                Session.set("current_game", game._id);
		    }
        },
        'click #FW_button': function () {
		    if(!Busy.OnlyBusy){
		    	$('#scoreFW').show();
	        	$('#scoreCC').hide();
				$('#tablero').hide();
				Busy_tablero = false;
		        $('#container').hide();
			    $('#gamecontainer').show();
			    $('#waiting_matches').hide();
				$('#points').show();
			    var game = Games.findOne({g_name:"FrootWars"});
			    Session.set("current_game", game._id);
            }
        },
	    'click #CC_button': function () {
	        if(!Busy.OnlyBusy && !Busy.Busy_joined){
	        	$('#scoreFW').hide();
	        	$('#scoreCC').show();
		        $('#container').hide();
			    $('#waiting_for_players').hide()
			    $('#gamecontainer').hide();
			    $('#waiting_matches').show();
			    $('#display_matches').show();
				if (Busy_tablero = false){
					$('#tablero').show();
					Busy_tablero = true
				}
				
			    $('#game_features').hide();
				$('#points_id').show();
			    var game = Games.findOne({g_name:"Carcason"});
			    Session.set("current_game", game._id);
            }else if(Busy.Busy_joined){
            	$('#scoreFW').hide();
	        	$('#scoreCC').show();
                $('#container').hide();
		        $('#waiting_for_players').hide()
			    $('#gamecontainer').hide();
			    $('#waiting_matches').show();
			    $('#display_matches').show();
			    $('#game_features').hide();
				if (Busy_tablero = false){
					$('#tablero').show();
					Busy_tablero = true
				}
                $('#player_joined').show();
			    var game = Games.findOne({g_name:"Carcason"});
			    Session.set("current_game", game._id);
            }
        },
        'click #New_G': function () {
            if(!Busy.OnlyBusy && !Busy.Busy_Playing && !Busy.Busy_joined){
                if(Meteor.userId()){
               	    console.log("//////////////((((((((((((((((((///////////////////");
                	$('#scoreFW').hide();
	        		$('#scoreCC').show();
					$('#tablero').hide();
					Busy_tablero = false
                    $('#container').hide();
                    $('#gamecontainer').hide();
				    $('#game_features').show();
				    $('#waiting_matches').show();
				    $('#waiting_for_players').hide()
		            $('#display_matches').hide();		
					$('#points').hide();			
					console.log("NEW G");	
		            var game = Games.findOne({g_name:"Carcason"});
				    Session.set("current_game", game._id);            
			    }else{
			        alert('You must be logged in for create a new game');
			    }	         
            }	
        }
	}


    Template.draw_matches.matches_Wait = function () {
        var match_waiting_list = Matches_games.find({status: "Waiting"});
        var matches_Wait = [];

        match_waiting_list.forEach(function(m){
			console.log("((((((((((((((((((((((((((((((((((((((((");
            matches_Wait.push({propietario: m.owner , nombre_partida: m.match_name, num_jug: m.num_players});
			console.log(matches_Wait);
        });	
        return matches_Wait;		
    }


    Template.draw_matches.events = {
        'click .play_game_button': function () {
            if(Meteor.userId()){
                nombrePartida= this.nombre_partida; 
                jugadoresActual= Matches_games.findOne({match_name:nombrePartida}).players_array.length;
                jugadoresMax= Matches_games.findOne({match_name:nombrePartida}).num_players;
                if(jugadoresActual < jugadoresMax ){				
			        $('#display_matches').hide();
					$('#waiting_matches').hide();	
					var id_insert= Meteor.userId();
					Busy.Busy_joined = true;					     
					var jugador= Object.create(Object.prototype);
					actualizar_jugadores = Matches_games.findOne({match_name:nombrePartida}).players_array;
					id_partida = Matches_games.findOne({match_name:nombrePartida})._id;
					jugador.idJugador = id_insert;	
					jugador.nombreJugador = Meteor.users.findOne(id_insert).username; 
					jugador.puntuacion = 0; 
                    actualizar_jugadores.push(jugador);
					Matches_games.update(id_partida,{$set: {players_array: actualizar_jugadores}});	
                }else{
                    alert("La partida esta llena");
                }
			}else{
				alert("You must be logged in for join a match");
			}
		}
    }


	Template.chat.none = function (){
        return Session.get("current_game") == "none";
	}



    Template.chat_messages.messages = function () {
        var messagesColl =  Messages_games.find({}, { sort: { time: -1 }});
		var messages = [];

		messagesColl.forEach(function(m){
		    var userName = Meteor.users.findOne(m.user_id).username;
		    messages.push({name: userName , message: m.message});
		});

    	return messages;
    }
    
    Template.chat.gameName = function (){
        var game_id = Session.get("current_game");         
        
        if (game_id){
        		console.log("//////////////////////////////////////////////");
            var game_name = Games.findOne({_id: game_id}).g_name;
            console.log(game_name);		 
       }
        return game_name;
	}

	Template.best_players.none = function (){
		return Session.get("current_game") == "none";
	}

   Template.best_players.gameName = function (){
		var game_id = Session.get("current_game");

		if (game_id){
			console.log("<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<");
			var game_name = Games.findOne({_id: game_id}).g_name;
			console.log(Games.findOne({_id: game_id}).g_name);
		}
		return game_name;
	}
	
	Template.best_players.list_players_cc = function (){
   	
		var matches_cc = Users_score_cc.find({}, {limit:5, sort: {score:-1}});
		var users_data = [];
		matches_cc.forEach (function (m) {
			var user = Meteor.users.findOne({_id: m.user_id});
			if (user){
					console.log("AAAAAAAAIAIIIIAIAIIAIAIAIAIAIIAIAIAIIA");
					var game = Games.findOne({_id: m.game_id});
					users_data.push({name: user.username, game: game.g_name, points: m.score});
				}
			});
		return users_data;
	}

   Template.best_players.list_players = function (){
   	
		var matches = Users_score.find({}, {limit:5, sort: {points:-1}});
		var users_data = [];
		matches.forEach (function (m) {
			var user = Meteor.users.findOne({_id: m.user_id});
			if (user){
				var game = Games.findOne({_id: m.game_id});
				users_data.push({name: user.username, game: game.g_name, points: m.points});
				}
			});
		return users_data;
	}
	
	
    
    
   // Mostrar la puntuación de cada jugador, a partir de la base de datos de users_data
    // Template.players.players_points = function(){
      
    // 		 var users_data= Users_data.find ({}, {sort: {time:-1}});
    // 		 var list_players = [];
    // 		 users_data.forEach (function (u) {
    // 		     var user = Meteor.users.findOne({_id:partida.usr_id});
    // 		     if(user){
    // 		         list_players.push({puntos: u.usr_score, player:u.nick}) // El         
    // 		     }
    // 		 });
    
    // 	 return list_players;    
    //  }

    Template.input.events = {
        'keydown input#message' : function (event) {
            if (event.which == 13) {
                console.log('has pulsado intro');
		        if (Meteor.userId()){
		            var user_id = Meteor.user()._id;
		            var message = $('#message');
		            if (message.length != 0) {
		                console.log('guardo el mensaje');
		                Messages_games.insert({
		                    user_id: user_id,
		                    message: message.val(),
		                    time: Date.now(),
		                    game_id: Session.get("current_game")
		                });
		                message.val('')
		            }
		        }else{
		            $("#login-error").show();
		        }
		    }
		} 
	}
	
var reactiva = null;
Tracker.autorun(function(){

    reactiva = Turno.find();
    //console.log(reactiva);    
    reactiva.forEach(function(m){
   
        if(m.Comando === "EmpezarPartida" && m.ladoscroll == ""){
            console.log("1111");
            $('#tablero').show();
            EmpezarTodo(m.ID_Partida, m.Jugadores, m.User_id);
        }
        if(Meteor.userId() != User_IdIA){
		    if(!m.scroll){
                if(m.Comando === "PedirPieza"){
                    if(!m.rotacion){            
                        console.log("2222") ; 
                        var piezaNueva = new pieza (m.nombrePieza, 11.5*64, 8*64, false, 0, false);
                        board.add(piezaNueva);
                    }else{
                        rotacionTracker = [m.rotacion, m.numRotacion];
                    }
                
                }else if(m.Comando === "ColocarPieza"){
				    colocadaTracker = true;
	                xTracker = m.posx;
				    yTracker = m.posy;
				    xIA = m.casillaX;
				    yIA = m.casillaY;
                } else if (m.Comando === "ColocarSeguidor") {
				    colocadoSegTracker = true;
				    xsegTracker = m.posxseg;
				    ysegTracker = m.posyseg;
				    numcolor = m.numColor;
                    console.log("33333"); 
                    
                    
                } else if (m.Comando === "BorrarSeguidor") {
                           	
                   	console.log("44441111111");
                	var array = m.arrayQuitarSeg;
                	array.forEach(function (e, i) {						
			            borrarSeguidor(e.x, e.y);
			            console.log("llamado borrar seguidor desde client");
			        });
        			
        			console.log("4444");
                	
                
                    
                }else if (m.Comando === "ActualizarTurno") {
						
				     JugadoresIA = m.Jugadores;
				     User_IdIA = m.User_id;
				     console.log("55555")
				     if(Meteor.userId() === User_IdIA){
						    numcolor = m.numColor;
						    otrapieza = true;
						    DejarScroll = true;
				       		Game.setBoard(2,new TextoPideFicha("Pulsa enter para pedir ficha ",playGame));
						    console.log("66666") ;
		      		     }
		     		console.log("77777") ;
				    Game.setBoard(1,new Jugadores(JugadoresIA));
				    
			    }else if (m.Comando === "JugadaIA") {
			        
			        var piezaNueva = new pieza (m.nombrePieza, m.posx, m.posy, true, m.numRotacion, true);
	                board.add(piezaNueva);
					numcolor = m.numColor;
					if (m.posxseg !=0 && m.posyseg !=0){
			            var seguidor = new Seguidor (m.posxseg, m.posyseg,verColorSeg(), m.casillaX, m.casillaY);
			            board.add (seguidor);
		            }
			        console.log("8888888");
			    
			    }else if (m.Comando === "FinPartida"){
			        console.log("10000000");
			        Game.setBoard(6,new final(m.resumenFinal));   
			    
			    }else if (m.Comando === "FinPL"){
			        console.log("11000000");
			        partidaTerminada(m.objetoPL);
			    
			    }
		    }else{
			    DejarScroll = true;
			    ladoScrollTracker = m.ladoscroll;
			    contadorScroll++;
			    //ScrollTracker = false;
			    console.log("999999")		
	      	}
		} else {
				if(m.Comando === "ActualizarTurno") {
						
				     JugadoresIA = m.Jugadores;
				     User_IdIA = m.User_id;
				     console.log("55555")
				     if(Meteor.userId() === User_IdIA){
						    numcolor = m.numColor;
						    otrapieza = true;
						    DejarScroll = true;
				       		Game.setBoard(2,new TextoPideFicha("Pulsa enter para pedir ficha ",playGame));
						    console.log("66666") ;
		      		     }
		     		console.log("77777") ;
				    Game.setBoard(1,new Jugadores(JugadoresIA));
				}else{
		    //if(m.Comando === "ActualizarTurno"){
		        	JugadoresIA = m.Jugadores;
				    User_IdIA = m.User_id;
		       		Game.setBoard(1,new Jugadores(JugadoresIA));
           		}
            //}
        }
        
    });
        
});


Accounts.ui.config({
        passwordSignupFields: "USERNAME_ONLY"
});
/*
Accounts.ui.config({
        passwordSignupFields: 'USERNAME_AND_OPTIONAL_EMAIL'
});*/
