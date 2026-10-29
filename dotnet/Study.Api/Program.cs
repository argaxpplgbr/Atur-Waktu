using System.Net.Http.Json;
using Study.Api.Models;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddHttpClient("python", client =>
{
    client.BaseAddress = new Uri(builder.Configuration["PythonService:BaseUrl"] ?? "http://localhost:8000");
    client.Timeout = TimeSpan.FromSeconds(10);
});
builder.Services.AddCors(options => options.AddPolicy("frontend", policy =>
    policy.WithOrigins("http://localhost:5500", "http://127.0.0.1:5500").AllowAnyHeader().AllowAnyMethod()));

var app = builder.Build();
app.UseCors("frontend");
app.MapGet("/health", () => Results.Ok(new { status = "ok", service = "study-api" }));
app.MapPost("/api/study/recommend", async (StudyRequest request, IHttpClientFactory clients, CancellationToken ct) =>
{
    var errors = new Dictionary<string, string[]>();
    if (request.AvailableMinutes is < 10 or > 180) errors["availableMinutes"] = ["Waktu tersedia harus 10–180 menit."];
    if (request.EnergyLevel is < 1 or > 5) errors["energyLevel"] = ["Energi harus 1–5."];
    if (request.DistractionLevel is < 1 or > 5) errors["distractionLevel"] = ["Gangguan harus 1–5."];
    if (errors.Count > 0) return Results.ValidationProblem(errors);
    try
    {
        var response = await clients.CreateClient("python").PostAsJsonAsync("/recommend", request, ct);
        using (response)
        {
            var result = await response.Content.ReadFromJsonAsync<StudyResponse>(cancellationToken: ct);
            return !response.IsSuccessStatusCode || result is null
                ? Results.Problem("Layanan rekomendasi Python menolak permintaan.", statusCode: 502)
                : Results.Ok(result);
        }
    }
    catch (HttpRequestException)
    {
        return Results.Problem("Python tidak dapat dihubungi. Pastikan FastAPI berjalan di port 8000.", statusCode: 502);
    }
    catch (TaskCanceledException) when (!ct.IsCancellationRequested)
    {
        return Results.Problem("Layanan Python melewati batas waktu 10 detik.", statusCode: 504);
    }
});
app.Run();
