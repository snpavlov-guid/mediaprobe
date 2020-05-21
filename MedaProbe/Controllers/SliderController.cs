using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;

namespace CoreProbe1.Controllers
{
    public class SliderController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }

        public IActionResult ContentSlider()
        {
            return View();
        }

        public IActionResult LiquidSlider()
        {
            return View();
        }
    }
}