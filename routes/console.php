<?php

use Illuminate\Support\Facades\Schedule;

Schedule::command('auth:clear-resets')
    ->daily()
    ->description('Eliminar tokens de restablecimiento de contraseña caducados');
