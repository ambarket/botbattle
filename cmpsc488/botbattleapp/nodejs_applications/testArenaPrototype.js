/* checkout
https://www.npmjs.com/package/fs-extra
*/
module.exports=function(botBattleAppServer) {
	//botBattleAppServer.addStaticRoute('/','/static/testArena.html');
	
	botBattleAppServer.addDynamicRoute('get', '/',function(req,res){
	      res.sendFile(__dirname + '/static/testArena.html');
	});
	
    
    // Serve static images files
	botBattleAppServer.addStaticRoute('/static/images', '/static/images/');
}