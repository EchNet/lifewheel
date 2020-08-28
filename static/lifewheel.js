window.LifeWheel = (function(options) {
  return {
    define: function(func) {
      const hash = func(options)
      Object.assign(window.LifeWheel, hash)
    }
  }
})("*** LIFEWHEEL_OPTIONS ***");
