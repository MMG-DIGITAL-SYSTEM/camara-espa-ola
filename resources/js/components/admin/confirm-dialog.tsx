import type { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';

export function ConfirmDialog({
    trigger,
    titulo,
    descripcion,
    textoConfirmar = 'Confirmar',
    onConfirmar,
    procesando = false,
    abierto,
    onAbiertoChange,
}: {
    trigger?: ReactNode;
    titulo: string;
    descripcion: string;
    textoConfirmar?: string;
    onConfirmar: () => void;
    procesando?: boolean;
    abierto?: boolean;
    onAbiertoChange?: (abierto: boolean) => void;
}) {
    return (
        <Dialog open={abierto} onOpenChange={onAbiertoChange}>
            {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{titulo}</DialogTitle>
                    <DialogDescription>{descripcion}</DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => onAbiertoChange?.(false)}
                    >
                        Cancelar
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={onConfirmar}
                        disabled={procesando}
                    >
                        {textoConfirmar}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
