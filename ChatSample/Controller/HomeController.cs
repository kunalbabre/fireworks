using ChatSample.Hubs;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using System.Threading.Tasks;

public class HomeController : Controller
{
    public IHubContext<FireworkHub> _strongFireworkHubContext { get; }

    public HomeController(IHubContext<FireworkHub> fireworkHubContext)
    {
        _strongFireworkHubContext = fireworkHubContext;
    }

    public IActionResult Index()
    {
        return View();
    }

    public bool SingleShot()
    {
        return _strongFireworkHubContext.Clients.All.SendAsync("broadcastFirework").IsCompleted;
    }


    public bool MultiShot()
    {
        return _strongFireworkHubContext.Clients.All.SendAsync("multiFirework").IsCompleted;
    }


    public bool IsRunning()
    {
        return !FireworkHub.isCrashed;
    }

    public bool ToggleCrash()
    {
        FireworkHub.isCrashed = !FireworkHub.isCrashed;
        return FireworkHub.isCrashed;
    }
}