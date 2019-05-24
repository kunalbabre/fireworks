using Microsoft.AspNetCore.SignalR;
using System.Threading;

namespace ChatSample.Hubs
{
    public class FireworkHub : Hub
    {
        public static bool isCrashed=false;

        public void Send()
        {
            if (isCrashed) return;
            // Call the FireworksCounter method light a rocket!.
            Clients.All.SendAsync("broadcastFirework");
        }
        public void SendMultiShot()
        {
            if (isCrashed) return;
            // Call the FireworksCounter method light a rocket!.
            Clients.All.SendAsync("multiFirework");
        }

        public void CrashMe()
        {
            isCrashed = !isCrashed;
        }


        public bool IsRunning()
        {
            return !isCrashed;
        }


    }
}