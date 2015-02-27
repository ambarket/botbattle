/* checkout
https://www.npmjs.com/package/fs-extra
*/
module.exports=function(botBattleAppServer) {
	//botBattleAppServer.addStaticRoute('/','/static/testArena.html');
	
	botBattleAppServer.addStaticFileRoute('/','/static/html/testArena.html');
	
    
    // Serve static images files
	botBattleAppServer.addStaticFolderRoute('/static/images', '/static/images/');
}