using Fireworks.Hubs;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.DependencyInjection;
using StackExchange.Redis;
using System;
using Microsoft.AspNetCore.Owin;

namespace Fireworks
{
    public class Startup
    {
        // This method gets called by the runtime. Use this method to add services to the container.
        // For more information on how to configure your application, visit https://go.microsoft.com/fwlink/?LinkID=398940

        public void ConfigureServices(IServiceCollection services)
        {
            string redisConnectionString = Environment.GetEnvironmentVariable("SIGNALR_CS");


            services.AddCors(options => options.AddPolicy("CorsPolicy",
            builder =>
            {
                builder.AllowAnyMethod().AllowAnyHeader().AllowAnyOrigin().AllowCredentials();
            }));



            if (string.IsNullOrEmpty(redisConnectionString))
            {
                services.AddSignalR();
            }
            else
            {


                if (redisConnectionString.Contains("service.signalr.net"))
                {
                    services.AddSignalR().AddAzureSignalR(redisConnectionString);
                    FireHub.UsingAzureSignalr = true;

                }
                else
                {
                    services.AddSignalR().AddStackExchangeRedis(redisConnectionString, options =>
                    {
                        options.Configuration.ClientName = "FireworksSignalR";
                        options.Configuration.AllowAdmin = true;
                    });
                    FireHub.UsingRedis = true;

                }
                


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

            app.UseCors("CorsPolicy");
            app.UseMvc(routes =>
            {
                routes.MapRoute(
                    name: "default",
                    template: "{controller=Home}/{action=Index}/{id?}");
                
            });

            if (FireHub.UsingAzureSignalr)
            {
                app.UseAzureSignalR(routes =>
                {
                    routes.MapHub<FireHub>("/firehub");
                });

            }
            else
            {
                app.UseSignalR(routes =>
                {
                    routes.MapHub<FireHub>("/firehub");
                });
            }



        }
    }
}
