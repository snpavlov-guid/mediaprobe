using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;

namespace CoreProbe1.Controllers
{
    public class EffectController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }

        public IActionResult VideoCube()
        {
            return View();
        }

        public IActionResult VideoClipped()
        {
            return View();
        }

        public IActionResult VideoZenit()
        {
            return View();
        }
    }
}