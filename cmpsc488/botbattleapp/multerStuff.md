     // Add multer
        // This needs pulled out of here
        // security issues
        // https://github.com/jpfluger/multer/blob/examples/multer-upload-files-to-different-directories.md
        var multer = require('multer');
        self.addMiddleware(multer({
          dest : paths.local_storage.uploads,
          limits: {
            fieldNameSize: 100,
            //files: 2,
            //fields: 5
            //fieldNameSize - integer - Max field name size (Default: 100 bytes)
            //fieldSize - integer - Max field value size (Default: 1MB)
            //fields - integer - Max number of non-file fields (Default: Infinity)
            //fileSize - integer - For multipart forms, the max file size (in bytes) (Default: Infinity)
            //files - integer - For multipart forms, the max number of file fields (Default: Infinity)
            //parts - integer - For multipart forms, the max number of parts (fields + files) (Default: Infinity)
            //headerPairs - integer - For multipart forms, the max number of header key=>value pairs to parse Default: 2000 (same as node's http).
          },
          //putSingleFilesInArray: true, // this needs doen for future compat. but will break current multiproto.
          rename : function(fieldname, filename) {
            return filename;
          },
          //changeDest: function(dest, req, res) {
          //    return dest + '/user1'; 
          //},
          onFileUploadStart: function (file, req, res) {
            console.log(file.fieldname + ' is starting ...');
            //if (file.originalname == 'virus.exe') return false;
          },
          onFileUploadComplete: function (file, req, res) {
            console.log(file.fieldname + ' uploaded to  ' + file.path);
            //add logic to check the file fieldname and change save directory and name based on this
          },
          onFileUploadData: function (file, data, req, res) {
            console.log(data.length + ' of ' + file.fieldname + ' arrived')
          },
          onParseStart: function () {
            console.log('Form parsing started at: ', new Date())
          },
          onParseEnd: function (req, next) {
            console.log('Form parsing completed at: ', new Date());
            
            // Dont need to do any custom parsing, also don't need half these options
            //   but leave them for now
            // usage example: custom body parse
            //req.body = require('qs').parse(req.body);
            //console.log("HERE!");
            //console.log(require.resolve('qs'));
    
            // call the next middleware
            next();
          },
          onError: function (error, next) {
            console.log(error)
            next(error)
          },
          onFileSizeLimit: function (file) {
            console.log('Failed: ', file.originalname)
            fs.unlink('./' + file.path) // delete the partially written file // set in limit object
          },
          onFilesLimit: function () {
            console.log('Crossed file limit!')
          },
          onFieldsLimit: function () {
            console.log('Crossed fields limit!')
          },
          onPartsLimit: function () {
          console.log('Crossed parts limit!')
          },
        }));