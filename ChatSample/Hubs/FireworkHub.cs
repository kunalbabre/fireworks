using Microsoft.AspNetCore.SignalR;

namespace ChatSample.Hubs
{
    public class FireworkHub : Hub
    {
        public void Send()
        {
            // Call the FireworksCounter method light a rocket!.
            Clients.All.SendAsync("broadcastFirework");
        }
        public void SendMultiShot()
        {
            // Call the FireworksCounter method light a rocket!.
            Clients.All.SendAsync("multiFirework");
        }
    }
}