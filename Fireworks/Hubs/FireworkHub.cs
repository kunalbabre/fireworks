using Microsoft.AspNetCore.SignalR;
using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace Fireworks.Hubs
{


    public class FireHub : Hub
    {
        public static bool IsCrashed = false;
        public static bool UsingRedis = false;
        public static bool UsingAzureSignalr = false;

        public void Send()
        {
            SendSingleShot();
        }

        public void SendSingleShot()
        {
            if (IsCrashed) return;
            // Call the FireworksCounter method light a rocket!.
            Clients.All.SendAsync("broadcastFirework");
        }

        public void SendMultiShot()
        {
            if (IsCrashed) return;
            // Call the FireworksCounter method light a rocket!.
            Clients.All.SendAsync("multiFirework");
        }

        public void HeartBeat()
        {
            Clients.Caller.SendAsync("heartBeat", IsCrashed, UsingRedis, UsingAzureSignalr);
        }

        public void CrashMe()
        {
            IsCrashed = !IsCrashed;
            Clients.All.SendAsync("heartBeat", IsCrashed);
        }


        public bool IsRunning()
        {
            return !IsCrashed;
        }

        


    }
}