# Javascript mvc framework for browser

# Usage

	Break your app on views, controllers and models.
	Your views is Django-like templates powered by Swig template engine.
	There is state manager, so you can assign your controllers to some state.
	Models consist of fields and are saved in browser localstorage or websql or smth like that, persistence powered by Lawnchair.
	There is event dispatcher based on EventEmitter2. You can subscribe to event
	or publish event.

# app

	var Application = fel.core.Application.extend({
		__init__: function(){
			var self = this;
			$(document).on("ready", function(){
				var translations = {
					ru: {
						"main": "главная",
						"hello, {0}": "привет {0}"
					}
				};
				var options = {
					views: {
						translations: {
							source: translations
						}
					},
					events: {
						"application.after_start": function(app){
							console.log("app started!"); 
							var User = app.models_manager.User;
							User.remove_all();
							var user1 = new User({id: "stas", age:23, occupation: "programmer", birthday: new Date(), man: true});
						}
					},
					controllers:{
						initial_state: "login",
						states: {
							login: {
								enter: function(state_manager){ 
									console.log("entered to login"); 
									state_manager.event("logged_in");
								},
								logged_in: "chat" //you can define next state as string
							},
							chat: ChatController
						}
					},
					models: {
						User: {
							age: "int",
							man: "boolean"
						}
					}
				};
				self.start(options);
				console.log("tr", fel.views.Translator().translate("hello, {0}", "Stas")); //translations
			});
		}
	});
	window.app = new Application();

# controller

	window.ChatController = fel.controllers.Controller.extend({
		enter: function(state_manager){ 
			console.log("entered to chat state");
			var v = new fel.views.View("main_page", {foo: "bar"});
			v.render("#container");
			state_manager.event("send");
		},
		send: function(){ console.log("i sent msg!"); }
	});

# templates(place them in head section of your index.html)
	
	<script data-name="page" type="text/x-template">
		{%block before_page %}{%endblock%}
		<div id="{{page_id}}" data-role="page">
			<div data-role="header" data-position="fixed" style="text-align: center;">
				{%block header %}{% endblock %}
			</div>
			<div data-role="content">
				{%block content %}{% endblock %}
			</div>
			<div data-role="footer" data-position="fixed">
				{%block footer %}{% endblock %}
			</div>
		</div>
		{%block after_page %}{%endblock%}
	</script>
	<script data-name="main_page" type="text/x-template">
		{%extends "page" %}
		{% set page_id = "main_page" %}
		{%block header %}
			<h3>{{"main"|trans}}</h3>
		{% endblock %}
		{%block content %}
			foo: {{foo}}
		    <ul data-role="listview">
		        <li data-icon="false"><a href="#">Home</a></li>
		        <li data-icon="false"><a href="#">About </a></li>
		        <li data-icon="false"><a href="#">Portfolio </a></li>
		        <li data-icon="false"><a href="#">Contact </a></li>
		    </ul>
		{%endblock%}
		{%block footer %}{% endblock %}
	</script>
	
# License

	This software is licensed under the BSD License. See the license file in the top distribution directory for the full license text.
