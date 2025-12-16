import { Component } from '@angular/core';

@Component({
    standalone: true,
    selector: 'app-footer',
    template: `<div class="layout-footer">
        Agro Dash by
        <a href="https://github.com/lucasfstmd" target="_blank" rel="noopener noreferrer" class="text-primary font-bold hover:underline">Lucasfstmd</a>
    </div>`
})
export class AppFooter {}
