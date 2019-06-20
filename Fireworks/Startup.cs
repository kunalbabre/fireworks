using Fireworks.Hubs;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.DependencyInjection;
using StackExchange.Redis;
using System;

namespace ChatSample
{
    public class Startup
    {
        // This method gets called by the runtime. Use this method to add services to the container.
        // For more information on how to configure your application, visit https://go.microsoft.com/fwlink/?LinkID=398940
        public void ConfigureServices(IServiceCollection services)
        {
            string redisConnectionString = Environment.GetEnvironmentVariable("REDIS_CS");


            if (string.IsNullOrEmpty(redisConnectionString))
            {
                services.AddSignalR();
            }
            else
            {
               
               
                services.AddSignalR().AddStackExchangeRedis(redisConnectionString, options =>
                {
                    options.Configuration.ClientName = "FireworksSignalR";
                    options.Configuration.AllowAdmin = true;
                });



            }
           
            services.AddMvc();

        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IHostingEnvironment env)
        {
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }

            app.UseHttpsRedirection();
            app.UseStaticFiles();
            app.UseCookiePolicy();
            
            app.UseMvc(routes =>
            {
                routes.MapRoute(
                    name: "default",
                    template: "{controller=Home}/{action=Index}/{id?}");
                
            });
            

            app.UseSignalR(routes =>
            {
                routes.MapHub<FireHub>("/fire");
            });



        }
    }
}
