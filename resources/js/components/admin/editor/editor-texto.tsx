import Link from '@tiptap/extension-link';
import { EditorContent, useEditor } from '@tiptap/react';
import type { Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import {
    Bold,
    Heading2,
    Heading3,
    Italic,
    Link2,
    Link2Off,
    List,
    ListOrdered,
    Quote,
    Undo2,
} from 'lucide-react';
import { useCallback } from 'react';
import type { ComponentType } from 'react';
import { Toggle } from '@/components/ui/toggle';

type Accion = {
    icono: ComponentType<{ className?: string }>;
    etiqueta: string;
    activo: (editor: Editor) => boolean;
    ejecutar: (editor: Editor) => void;
};

const ACCIONES: Accion[] = [
    {
        icono: Bold,
        etiqueta: 'Negrita',
        activo: (e) => e.isActive('bold'),
        ejecutar: (e) => e.chain().focus().toggleBold().run(),
    },
    {
        icono: Italic,
        etiqueta: 'Cursiva',
        activo: (e) => e.isActive('italic'),
        ejecutar: (e) => e.chain().focus().toggleItalic().run(),
    },
    {
        icono: Heading2,
        etiqueta: 'Título',
        activo: (e) => e.isActive('heading', { level: 2 }),
        ejecutar: (e) => e.chain().focus().toggleHeading({ level: 2 }).run(),
    },
    {
        icono: Heading3,
        etiqueta: 'Subtítulo',
        activo: (e) => e.isActive('heading', { level: 3 }),
        ejecutar: (e) => e.chain().focus().toggleHeading({ level: 3 }).run(),
    },
    {
        icono: List,
        etiqueta: 'Lista con viñetas',
        activo: (e) => e.isActive('bulletList'),
        ejecutar: (e) => e.chain().focus().toggleBulletList().run(),
    },
    {
        icono: ListOrdered,
        etiqueta: 'Lista numerada',
        activo: (e) => e.isActive('orderedList'),
        ejecutar: (e) => e.chain().focus().toggleOrderedList().run(),
    },
    {
        icono: Quote,
        etiqueta: 'Cita',
        activo: (e) => e.isActive('blockquote'),
        ejecutar: (e) => e.chain().focus().toggleBlockquote().run(),
    },
];

/**
 * Editor de texto enriquecido.
 *
 * El HTML que produce se sanea en el servidor antes de guardarse: aquí no se
 * asume que lo que salga sea seguro.
 *
 * El componente es *no controlado* a propósito. Rehidratar el contenido en
 * cada pulsación movería el cursor al final; el padre lo remonta con `key`
 * cuando cambia la sección editada.
 */
export function EditorTexto({
    valor,
    onCambio,
}: {
    valor: string;
    onCambio: (html: string) => void;
}) {
    const editor = useEditor({
        immediatelyRender: false,
        extensions: [
            StarterKit.configure({
                heading: { levels: [2, 3] },
                // El sitio público no usa estos y el saneador los quitaría.
                horizontalRule: false,
                codeBlock: false,
            }),
            Link.configure({
                openOnClick: false,
                autolink: true,
                defaultProtocol: 'https',
            }),
        ],
        content: valor || '<p></p>',
        onUpdate: ({ editor }) => {
            const html = editor.getHTML();

            // TipTap deja esto cuando se vacía del todo.
            onCambio(html === '<p></p>' ? '' : html);
        },
        editorProps: {
            attributes: {
                class: 'min-h-32 max-h-80 overflow-y-auto px-3 py-2 text-sm outline-none [&_a]:text-marca [&_a]:underline [&_blockquote]:border-l-2 [&_blockquote]:border-border [&_blockquote]:pl-3 [&_blockquote]:italic [&_h2]:mb-1 [&_h2]:mt-3 [&_h2]:text-base [&_h2]:font-semibold [&_h3]:mb-1 [&_h3]:mt-3 [&_h3]:text-sm [&_h3]:font-semibold [&_li]:mb-0.5 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:mb-2 [&_ul]:list-disc [&_ul]:pl-5',
            },
        },
    });

    const alternarEnlace = useCallback(() => {
        if (!editor) {
            return;
        }

        if (editor.isActive('link')) {
            editor.chain().focus().unsetLink().run();

            return;
        }

        const actual = editor.getAttributes('link').href ?? '';
        const url = window.prompt('Dirección del enlace', actual || 'https://');

        if (url === null) {
            return;
        }

        if (url.trim() === '') {
            editor.chain().focus().unsetLink().run();

            return;
        }

        editor
            .chain()
            .focus()
            .extendMarkRange('link')
            .setLink({ href: url.trim() })
            .run();
    }, [editor]);

    if (!editor) {
        return (
            <div className="h-40 animate-pulse rounded-md border bg-muted/40" />
        );
    }

    return (
        <div className="overflow-hidden rounded-md border focus-within:ring-2 focus-within:ring-ring">
            <div className="flex flex-wrap items-center gap-0.5 border-b bg-muted/40 px-1 py-1">
                {ACCIONES.map(
                    ({ icono: Icono, etiqueta, activo, ejecutar }) => (
                        <Toggle
                            key={etiqueta}
                            size="sm"
                            pressed={activo(editor)}
                            onPressedChange={() => ejecutar(editor)}
                            title={etiqueta}
                            aria-label={etiqueta}
                            className="size-7 p-0 data-[state=on]:bg-marca-suave data-[state=on]:text-marca"
                        >
                            <Icono className="size-3.5" />
                        </Toggle>
                    ),
                )}

                <Toggle
                    size="sm"
                    pressed={editor.isActive('link')}
                    onPressedChange={alternarEnlace}
                    title={
                        editor.isActive('link')
                            ? 'Quitar enlace'
                            : 'Añadir enlace'
                    }
                    aria-label={
                        editor.isActive('link')
                            ? 'Quitar enlace'
                            : 'Añadir enlace'
                    }
                    className="size-7 p-0 data-[state=on]:bg-marca-suave data-[state=on]:text-marca"
                >
                    {editor.isActive('link') ? (
                        <Link2Off className="size-3.5" />
                    ) : (
                        <Link2 className="size-3.5" />
                    )}
                </Toggle>

                <button
                    type="button"
                    onClick={() => editor.chain().focus().undo().run()}
                    disabled={!editor.can().undo()}
                    title="Deshacer en el texto"
                    aria-label="Deshacer en el texto"
                    className="ml-auto flex size-7 items-center justify-center rounded-sm text-muted-foreground transition-colors hover:bg-muted disabled:opacity-40"
                >
                    <Undo2 className="size-3.5" />
                </button>
            </div>

            <EditorContent editor={editor} />
        </div>
    );
}
