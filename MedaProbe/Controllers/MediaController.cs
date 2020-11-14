using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;

namespace CoreProbe1.Controllers
{
    public class MediaController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }

        public IActionResult CameraRecognition()
        {
            return View();
        }

        public IActionResult CameraBackground()
        {
            return View();
        }

    }
}