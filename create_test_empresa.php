User::create([
    'name' => 'Empresa Test',
    'email' => 'empresa@test.com', 
    'password' => Hash::make('password123'),
    'rol' => 'empresa'
]);
