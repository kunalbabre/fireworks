FROM mcr.microsoft.com/dotnet/core/aspnet:2.1-stretch-slim AS base
WORKDIR /app
EXPOSE 80

FROM mcr.microsoft.com/dotnet/core/sdk:2.1-stretch AS build
WORKDIR /src
COPY ["Fireworks/Fireworks.csproj", "Fireworks/"]
RUN dotnet restore "Fireworks/Fireworks.csproj"
COPY . .
WORKDIR "/src/Fireworks"
RUN dotnet build "Fireworks.csproj" -c Release -o /app

FROM build AS publish
RUN dotnet publish "Fireworks.csproj" -c Release -o /app

FROM base AS final
WORKDIR /app
COPY --from=publish /app .
ENTRYPOINT ["dotnet", "Fireworks.dll"]