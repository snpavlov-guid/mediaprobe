using System;
using CoreProbe1.Data;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.UI;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

//[assembly: HostingStartup(typeof(CoreProbe1.Areas.Identity.IdentityHostingStartup))]
//namespace CoreProbe1.Areas.Identity
//{
//    public class IdentityHostingStartup : IHostingStartup
//    {
//        public void Configure(IWebHostBuilder builder)
//        {
//            builder.ConfigureServices((context, services) => {
//                services.AddDbContext<CoreProbe1Context>(options =>
//                    options.UseSqlServer(
//                        context.Configuration.GetConnectionString("CoreProbe1ContextConnection")));

//                services.AddDefaultIdentity<IdentityUser>(options => options.SignIn.RequireConfirmedAccount = true)
//                    .AddEntityFrameworkStores<CoreProbe1Context>();
//            });
//        }
//    }
//}