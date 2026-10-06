# ---- build stage ----
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src
# Copy project files first so `dotnet restore` is cached until dependencies change.
COPY global.json HizbQuran.slnx ./
COPY src/HizbQuran.Api/HizbQuran.Api.csproj src/HizbQuran.Api/
COPY tests/HizbQuran.Api.Tests/HizbQuran.Api.Tests.csproj tests/HizbQuran.Api.Tests/
RUN dotnet restore
COPY . .
RUN dotnet publish src/HizbQuran.Api -c Release -o /app --no-restore

# ---- runtime stage (small image, no SDK) ----
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app
COPY --from=build /app .
# The aspnet image ships a non-root "app" user.
USER app
ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080
ENTRYPOINT ["dotnet", "HizbQuran.Api.dll"]
