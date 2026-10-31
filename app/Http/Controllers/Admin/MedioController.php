<?php

namespace App\Http\Controllers\Admin;

use App\Concerns\NotificaAlPanel;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\SubirMedioRequest;
use App\Models\Medio;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class MedioController extends Controller
{
    use NotificaAlPanel;

    private const POR_PAGINA = 24;

    public function index(Request $request): Response
    {
        return Inertia::render('Admin/Medios/Index', [
            'medios' => $this->listado($request),
            'filtros' => $request->only('buscar', 'tipo'),
        ]);
    }

    /**
     * Mismo listado en JSON, para el selector que se abre desde el editor.
     */
    public function listar(Request $request): JsonResponse
    {
        return response()->json($this->listado($request));
    }

    public function store(SubirMedioRequest $request): RedirectResponse
    {
        $subidos = 0;

        foreach ($request->file('archivos') as $archivo) {
            $this->guardar($archivo, $request->user()?->id);
            $subidos++;
        }

        return $this->exito(
            $subidos === 1 ? 'Archivo subido.' : "{$subidos} archivos subidos.",
        );
    }

    public function update(Request $request, Medio $medio): RedirectResponse
    {
        $medio->update($request->validate(
            ['alt' => ['nullable', 'string', 'max:255']],
            [],
            ['alt' => 'texto alternativo'],
        ));

        return $this->exito('Descripción actualizada.');
    }

    public function destroy(Medio $medio): RedirectResponse
    {
        // Primero el archivo: si falla el borrado en base, no queda huérfano.
        Storage::disk($medio->disco)->delete($medio->ruta);
        $medio->delete();

        return $this->exito('Archivo eliminado.');
    }

    /**
     * @return array<string, mixed>
     */
    private function listado(Request $request): array
    {
        $medios = Medio::query()
            ->when($request->filled('buscar'), function ($consulta) use ($request) {
                $termino = '%'.$request->string('buscar')->trim().'%';

                $consulta->where(fn ($q) => $q
                    ->where('nombre_original', 'ilike', $termino)
                    ->orWhere('alt', 'ilike', $termino));
            })
            ->when(
                $request->string('tipo')->toString() === 'imagenes',
                fn ($consulta) => $consulta->where('mime', 'like', 'image/%'),
            )
            ->when(
                $request->string('tipo')->toString() === 'documentos',
                fn ($consulta) => $consulta->where('mime', 'not like', 'image/%'),
            )
            ->latest()
            ->paginate(self::POR_PAGINA)
            ->withQueryString();

        return [
            'data' => $medios->getCollection()->map(fn (Medio $medio) => $medio->aArray())->all(),
            'links' => $medios->linkCollection()->toArray(),
            'from' => $medios->firstItem(),
            'to' => $medios->lastItem(),
            'total' => $medios->total(),
        ];
    }

    private function guardar(UploadedFile $archivo, ?int $autor): Medio
    {
        // Se agrupa por mes para que la carpeta no acabe con miles de archivos.
        $carpeta = 'medios/'.now()->format('Y/m');

        $nombre = Str::slug(
            pathinfo($archivo->getClientOriginalName(), PATHINFO_FILENAME),
        );

        $ruta = $archivo->storeAs(
            $carpeta,
            sprintf('%s-%s.%s', $nombre ?: 'archivo', Str::random(6), $archivo->getClientOriginalExtension()),
            'public',
        );

        [$ancho, $alto] = $this->dimensiones($archivo);

        return Medio::create([
            'disco' => 'public',
            'ruta' => $ruta,
            'nombre_original' => $archivo->getClientOriginalName(),
            'mime' => $archivo->getClientMimeType(),
            'tamano' => $archivo->getSize(),
            'ancho' => $ancho,
            'alto' => $alto,
            'created_by' => $autor,
        ]);
    }

    /**
     * @return array{0: int|null, 1: int|null}
     */
    private function dimensiones(UploadedFile $archivo): array
    {
        if (! str_starts_with($archivo->getClientMimeType(), 'image/')) {
            return [null, null];
        }

        // getimagesize no entiende SVG y devuelve false; no es un error.
        $medidas = @getimagesize($archivo->getRealPath());

        return $medidas ? [$medidas[0], $medidas[1]] : [null, null];
    }
}
