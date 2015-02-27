/* checkout
https://www.npmjs.com/package/fs-extra
*/
module.exports=function(server) {
	//botBattleAppServer.addStaticRoute('/','/static/testArena.html');
	
    server.addStaticFileRoute('/','/static/html/testArena.html');
	
    
    // Serve static images files
    server.addStaticFolderRoute('/static/images', '/static/images/');
}