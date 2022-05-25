<script setup>
import { RouterLink, RouterView } from 'vue-router'
import HelloWorld from '@/components/HelloWorld.vue'
</script>

<template>
<nav class="navbar navbar-dark navbar-expand-lg bg-dark">
<div class="container-fluid">
    <a class="navbar-brand" href="#">RES-HTTP Management UI</a>
    <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
      <span class="navbar-toggler-icon"></span>
    </button>
    <div class="collapse navbar-collapse" id="navbarSupportedContent">
      <ul class="navbar-nav me-auto mb-2 mb-lg-0">
        <li class="nav-item">
          <router-link :to="'/home'" class="nav-link">Home</router-link>
        </li>      
      </ul>
      <form class="d-flex" role="search">
      </form>
    </div>
  </div>
</nav>

  <RouterView />
</template>

<style>
@import '@/assets/base.css';

</style>
