
module.exports=function(server) {
	
    server.addStaticFileRoute('/','/static/html/testArena.html');
	
    
    // Serve static images files
    server.addStaticFolderRoute('/static/images', '/static/images/');
}