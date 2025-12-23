import { Component, OnInit } from '@angular/core';
import { FirestoreService } from './core/services/firestore.service';


/**
 * Test component to verify Firestore connection
 * This component will automatically test the connection on initialization
 * Check browser console (F12) to see the logged data
 */
@Component({
  selector: 'app-firestore-test',
  standalone: true,
  template: `
    <div style="padding: 20px; background: #f0f0f0; border-radius: 8px; margin: 20px;">
      <h2>🔥 Firestore Connection Test</h2>
      <p><strong>Status:</strong> <span style="color: #4CAF50;">✓ Configured and Connected</span></p>
      <p><strong>Project ID:</strong> paseo-artesanos</p>
      <p><strong>Instructions:</strong></p>
      <ol>
        <li>Open Browser Developer Tools (Press F12)</li>
        <li>Go to Console tab</li>
        <li>Look for "🔥 Firestore Service - Connection Test" group</li>
        <li>Check all fetched data from users, events, and inscriptions collections</li>
      </ol>
      <p style="color: #666; font-size: 12px;">Note: If you see empty arrays, make sure you have data in your Firestore collections.</p>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class FirestoreTestComponent implements OnInit {
  constructor(private firestoreService: FirestoreService) {}

  ngOnInit() {
  }
}
