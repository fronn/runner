/*
* workerJobs:
* -> emits: error, started, finished
* 
* workerJob is responsible for wrapping a task run with some emits
*
*/

var emitter = require('events').EventEmitter

function WorkerJob(){
  this.config = {
    jobName: ''
  }
  this.jobCb = void 0
}

/*
*
* jobFn = function()
*/
WorkerJob.prototype.job = function job(jobFn){
  this.jobCb = jobFn
}
    
/*
*
* cb = function(err, result, jobId)
*/
WorkerJob.prototype.run = function run(id, cb){
  emitter.emit('started', 'Started the job, ' 
               + module.exports.config.jobName +
               ', at ' + new Date().toString())
  
  try{
    this.jobCb()
    emitter.emit('finished', 'Finished the job (id: ' + id + ')')
    cb(void 0, 'finished', id)
  }
  catch(err){
    emitter.emit('error', err)
    cb(err, 'an uncaught exception happened.', id)
  }
  
  
}


module.exports = WorkerJob