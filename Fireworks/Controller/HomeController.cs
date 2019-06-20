using Fireworks.Hubs;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using System;
using System.Drawing;
using System.Net.Http;
using System.Threading.Tasks;

public class HomeController : Controller
{
    public IHubContext<FireHub> _strongFireworkHubContext { get; }

    public HomeController(IHubContext<FireHub> fireworkHubContext)
    {
        _strongFireworkHubContext = fireworkHubContext;
    }
    private string _appColor;
    private string AppColor
    {
        get
        {
            if (string.IsNullOrEmpty(_appColor))
            {
                var color = Environment.GetEnvironmentVariable("APP_COLOR");

                color = (string.IsNullOrEmpty(color))? string.Empty:color.ToLower().Trim();

                if (color != "red" && color != "blue" && color != "yellow" && color != "green")
                {
                    color = string.Empty;
                }
               

               

                _appColor = color;

            }
            return _appColor;
        }
    }
    public IActionResult Index()
    {
        ViewBag.Color = AppColor;
        ViewBag.IsAdmin = false;
        return View();
    }

    public IActionResult Admin()
    {
        ViewBag.Color = AppColor;
        ViewBag.IsAdmin = true;
        return View("Index");
    }

    public bool SingleShot()
    {
        return _strongFireworkHubContext.Clients.All.SendAsync("broadcastFirework").IsCompleted;
    }


    public bool MultiShot()
    {
        return _strongFireworkHubContext.Clients.All.SendAsync("multiFirework").IsCompleted;
    }



    public ActionResult IsRunning()
    {

        if (FireHub.IsCrashed)
        {
            return BadRequest();
        }
        else
        {
            return Ok();
        }

    }

    public bool ToggleCrash()
    {
        FireHub.IsCrashed = !FireHub.IsCrashed;
        return FireHub.IsCrashed;
    }
}