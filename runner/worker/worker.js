"use strict";
//TODO: listen for 'jobProgress' event and update status with that information


function Worker(){
  this._jobs = []
  this._runJobs = []
  this.running = false //of suspect usefulness?
  this.cb = void 0
  
  var self = this
  
  this._runJob = function _runJob(){
  if(self._jobs.length > 0){
    var jobConfig = self._jobs.shift()
    
    self.running = true
    jobConfig.running = true
    jobConfig.startedTime = new Date().toString()
    
    var jobRunner = new (require('../' + jobConfig.job.jobPath))()
    console.log('prepped job (name: ' + jobConfig.job.jobName + ', id: ' + jobConfig.job.id + ')')
    self._runJobs.push(jobConfig)
    
    jobRunner.workJob.run(jobConfig.job, self._clearJob)
    
    setTimeout(_runJob, 1000)
    } else {
      setTimeout(_runJob, 1000 * 60 * 10)
    }
  }

  this._clearJob = function _clearJob(err, result, jobId){
    if(err){
      //TODO: do something special?
    } 
    ///what if i don't find it, for some reason?
    var found = false
    self._runJobs.forEach(function(jobConfig){
      if(jobConfig.job.id === jobId){
        jobConfig.running = false
        jobConfig.err = err
        jobConfig.result = result
        jobConfig.stoppedTime = new Date().toString()
        found = true
      }
    })
    if(!found){
      ///TODO: freak out.
    }
    self.running = false
    //do something with result
    self.cb(err, result, jobId)
  }
}
Worker.prototype = {
  /*
  * Run the actual job
  * -> call the jobCallback when 'done' (either through error or otherwise)
  * -> jobCallback should look like: function(err, result, jobId) {}
  *
  * -> jobs is an array of Job objects
  */
  run: function run(jobs, jobCallback){
    if(jobCallback){
      this.cb = jobCallback
    } else {
      ///TODO: throw a fit... emit error?
    }

    var self = this
    jobs = jobs || []
    jobs.forEach(function(job){
      self._jobs.push({ 
        job: job, 
        running: false, 
        err: false, 
        finished: false,
        result: false
      })
    })
    
    setTimeout(this._runJob, 100)
  },
  /*
  * Add a job to the job queue
  * -> jobs is an array of Job objects
  */
  addJobs: function addJobs(jobs){
    var self = this
    jobs = jobs || []
    jobs.forEach(function(job){
      self._jobs.push({ 
        job: job, 
        running: false, 
        err: false, 
        finished: false,
        result: false
      })
    })
  },
  
  /*
  * Current status of the specified job
  */
  getStatusOfJob: function getStatusOfJob(jobId){
    ///runner needs to manage status of jobs - multiple could be running
    var status = void 0
    
    this._runJobs.forEach(function(jobConfig){
      if(jobConfig.job.id === jobId){
        status = jobConfig
      }
    })
    if(status !== void 0){
      return status
    } else {
      this._jobs.forEach(function(jobConfig){
        if(jobConfig.job.id === jobId){
          status = jobConfig
        }
      })
      return status
    }
  },
  /*
  *
  */
  getStatus: function getStatus(){
    var status = []
    status.push(this._jobs)
    status.push(this._runJobs)
  }
}
module.exports = Worker
