<script src="https://cdnjs.cloudflare.com/ajax/libs/socket.io/2.1.0/socket.io.dev.js"></script>


<style type="text/css">
	#contentWrap {
		display: none;
	}
</style>

<div id="nickWrap">
	<p>Enter UserName</p>
	<form id="setNick">
		<input type="text" id="nickname">
		<input type="submit">
	</form>
	<p id="nickErr"></p>
</div>

<div id="contentWrap">
	<div id="chatWrap">
		<div id="chat"></div>
		<form id="send-message">
			<input type="text" id="message" name="">
			<button type="submit" name="">Send</button>
		</form>
		<div id="users"></div>
	</div>
</div>
	

<script src="http://code.jquery.com/jquery-latest.min.js" type="text/javascript"></script>
<script src="/socket.io/socket.io.js" type="text/javascript"></script>
<script>
	$(document).ready(function () {
	
		var socket = io.connect();
		var $messageForm = $('#send-message');
		var $messageBox = $('#message');
		var $chat = $('#chat');

		$messageForm.submit(function(e){

			e.preventDefault(); //Because instead of submitting the form and refress we want to send the data to the server

			socket.emit('send message', $messageBox.val());
			$messageBox.val('');

		});

		socket.on('new message', function(data){
			$chat.append(data + '<br>');
	});

});	
</script>


<div id="chat"></div>
	<form id="send-message">
		<input type="text" id="message" name="">
		<button type="submit" name="">Send</button>
	</form>


<script src="/socket.io/socket.io.js" type="text/javascript"></script>
<script>
$(document).ready(function () {
	
		var socket = io.connect();

		var $nickForm = $('#setNick');
		var $nickBox = $('#nickname');
		var $nickErr = $('#nickErr');
		var $users = $('#users');

		var $messageForm = $('#send-message');
		var $messageBox = $('#message');
		var $chat = $('#chat');


		$nickForm.submit(function(e){
			e.preventDefault();

			socket.emit('new user', $nickBox.val(), function(data){
				if (data) {
					$('#nickWrap').hide();
					$('#contentWrap').show();
				}
				else{
					$nickErr.html('The UserName has already taken....');
				}
			});
			$nickBox.val('');
		});

		socket.on('usernames', function(data){
			for (var i = 0; i < data.length; i++) {
				var html += data[i] + '<br>';
			}
			$users.html(html);
		});

		$messageForm.submit(function(e){

			e.preventDefault(); //Because instead of submitting the form and refress we want to send the data to the server

			socket.emit('send message', $messageBox.val());
			$messageBox.val('');

		});

		socket.on('new message', function(data){
			$chat.append(data + '<br>');
	});

});	
</script>