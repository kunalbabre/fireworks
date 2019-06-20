using Microsoft.AspNetCore.SignalR;
using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace Fireworks.Hubs
{


    public class FireHub : Hub
    {
        public static bool isCrashed=false;

        public void Send()
        {
            SendSingleShot();
        }

        public void SendSingleShot()
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

        public void HeartBeat()
        {
            Clients.Caller.SendAsync("heartBeat", isCrashed);
        }

        public void CrashMe()
        {
            isCrashed = !isCrashed;
            Clients.All.SendAsync("heartBeat", isCrashed);
        }


        public bool IsRunning()
        {
            return !isCrashed;
        }

        


    }
}